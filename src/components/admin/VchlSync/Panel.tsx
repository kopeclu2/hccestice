'use client'

import { Banner, Button, Pill, toast } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import {
  describeChanges,
  ENTITY_LABEL,
  fmtDate,
  fmtDuration,
  fmtRelative,
  STATUS_LABEL,
  TRIGGER_LABEL,
  totalChanges,
  WARNING_LABEL,
} from './format'
import s from './styles.module.css'
import type { DetectPayload, LinkedWarning, RunPayload, RunRow, StatusPayload, VchlDiffEntry } from './types'

const TABS = [
  { key: 'overview', label: 'Přehled' },
  { key: 'history', label: 'Historie běhů' },
  { key: 'settings', label: 'Nastavení' },
] as const
type TabKey = (typeof TABS)[number]['key']

async function api<T>(path: string, init?: { method: 'POST'; body?: unknown }): Promise<T> {
  const res = await fetch(`/api/vchl-sync/${path}`, {
    method: init?.method ?? 'GET',
    credentials: 'same-origin',
    headers: init ? { 'Content-Type': 'application/json' } : undefined,
    body: init ? JSON.stringify(init.body ?? {}) : undefined,
  })
  const data = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) throw new Error(data.message || `Požadavek selhal (HTTP ${res.status}).`)
  return data
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Neznámá chyba.')

const statusPill = (status: string) => {
  const style = status === 'ok' ? 'success' : status === 'error' ? 'error' : status === 'partial' ? 'warning' : 'light-gray'
  return (
    <Pill pillStyle={style} size="small">
      {STATUS_LABEL[status] ?? status}
    </Pill>
  )
}

export const VchlSyncPanel: React.FC<{ sentryOrg: string | null }> = ({ sentryOrg }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const tabParam = params.get('tab')
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : 'overview'

  const [data, setData] = useState<StatusPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'run' | 'dry' | 'toggle'>(null)
  const [dry, setDry] = useState<RunPayload | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await api<StatusPayload>('status'))
      setLoadError(null)
    } catch (e) {
      setLoadError(errMsg(e))
    }
  }, [])

  useEffect(() => {
    // Načtení z API po připojení stránky; setState proběhne až po odpovědi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const setTab = (key: TabKey) => {
    const next = new URLSearchParams(params.toString())
    next.set('tab', key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  const run = async (dryRun: boolean) => {
    setBusy(dryRun ? 'dry' : 'run')
    try {
      const result = await api<RunPayload>('run', { method: 'POST', body: { dryRun } })
      if (dryRun) {
        setDry(result)
        toast.success(`Nanečisto hotovo: ${describeChanges(result.changes)}.`)
      } else if (result.status === 'error') {
        toast.error(`Synchronizace selhala: ${result.error ?? 'neznámá chyba'}`)
      } else {
        toast.success(`Synchronizace dokončena: ${describeChanges(result.changes)}.`)
      }
      await load()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }

  const toggle = async () => {
    if (!data) return
    const enabled = !data.status.enabled
    if (!enabled && !window.confirm('Opravdu vypnout automatickou synchronizaci? Zápasy a statistiky se přestanou aktualizovat samy.')) {
      return
    }
    setBusy('toggle')
    try {
      await api('toggle', { method: 'POST', body: { enabled } })
      toast.success(enabled ? 'Automatická synchronizace je zapnutá.' : 'Automatická synchronizace je vypnutá.')
      await load()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={s.root}>
      <div className={s.header}>
        <h1>Synchronizace VČHL</h1>
        <p>Automatické přebírání rozlosování, výsledků, sestav a tabulky z ahl.cz.</p>
      </div>

      <div className={s.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            aria-selected={tab === t.key}
            className={`${s.tab} ${tab === t.key ? s.tabActive : ''}`}
            key={t.key}
            onClick={() => setTab(t.key)}
            role="tab"
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadError && <Banner type="error">Nepodařilo se načíst stav: {loadError}</Banner>}

      {tab === 'overview' && (
        <Overview busy={busy} data={data} dry={dry} onRun={run} onToggle={toggle} />
      )}
      {tab === 'history' && <History runs={data?.runs ?? null} sentryOrg={sentryOrg} />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}

/* ------------------------------ Přehled ------------------------------ */

const Overview: React.FC<{
  busy: null | 'run' | 'dry' | 'toggle'
  data: StatusPayload | null
  dry: RunPayload | null
  onRun: (dryRun: boolean) => void
  onToggle: () => void
}> = ({ busy, data, dry, onRun, onToggle }) => {
  if (!data) return <p className={s.muted}>Načítám…</p>
  const { status, warnings } = data
  const last = status.lastRun
  const working = busy !== null || status.running

  return (
    <>
      <section className={s.card}>
        <dl className={`${s.grid} ${s.stat}`} style={{ margin: 0 }}>
          <div className={s.stat}>
            <dt>Automatická synchronizace</dt>
            <dd>
              <Pill pillStyle={status.enabled ? 'success' : 'light-gray'}>
                {status.enabled ? 'Zapnuto' : 'Vypnuto'}
              </Pill>
              {status.running && <Pill pillStyle="warning">Právě běží</Pill>}
            </dd>
          </div>
          <div className={s.stat}>
            <dt>Režim</dt>
            <dd>{status.mode === 'matchday' ? 'Zápasový (častěji)' : 'Klidový'}</dd>
          </div>
          <div className={s.stat}>
            <dt>Poslední běh</dt>
            <dd>
              {last ? (
                <>
                  <span>{fmtDate(last.startedAt)}</span>
                  {statusPill(last.status)}
                </>
              ) : (
                'zatím žádný'
              )}
            </dd>
            {last && <div className={s.muted}>{describeChanges(last.changes)}</div>}
          </div>
          <div className={s.stat}>
            <dt>Další běh</dt>
            <dd>
              {status.nextDueAt ? (
                <>
                  <span>{fmtDate(status.nextDueAt)}</span>
                  <span className={s.muted}>({fmtRelative(status.nextDueAt)})</span>
                </>
              ) : (
                'neplánováno (vypnuto)'
              )}
            </dd>
          </div>
        </dl>

        {last?.error && <p className={`${s.error} ${s.muted}`}>{last.error}</p>}

        <div className={s.actions}>
          <Button buttonStyle="primary" disabled={working} onClick={() => onRun(false)} size="medium">
            {busy === 'run' ? 'Synchronizuji…' : 'Spustit teď'}
          </Button>
          <Button buttonStyle="secondary" disabled={working} onClick={() => onRun(true)} size="medium">
            {busy === 'dry' ? 'Zkouším…' : 'Nanečisto'}
          </Button>
          <Button buttonStyle="secondary" disabled={working} onClick={onToggle} size="medium">
            {status.enabled ? 'Vypnout automatiku' : 'Zapnout automatiku'}
          </Button>
        </div>
        <p className={s.muted}>
          „Nanečisto“ stáhne data z AHL a ukáže, co by se změnilo, ale nic nezapíše. Běh trvá řádově
          desítky sekund.
        </p>
      </section>

      {dry && <DryResult result={dry} />}

      <section className={s.card}>
        <h2>Nevyřešená varování</h2>
        {warnings.length === 0 ? (
          <p className={s.muted}>Poslední běh nenahlásil žádná varování.</p>
        ) : (
          <WarningList warnings={warnings} />
        )}
      </section>
    </>
  )
}

const WarningList: React.FC<{ warnings: LinkedWarning[] }> = ({ warnings }) => (
  <ul className={s.list}>
    {warnings.map((w, i) => (
      <li key={`${w.type}:${w.ref ?? ''}:${i}`}>
        <Pill pillStyle="warning" size="small">
          {WARNING_LABEL[w.type] ?? w.type}
        </Pill>
        <span>{w.message}</span>
        {w.link && (
          <a href={w.link.href} rel="noreferrer" target="_blank">
            {w.link.label} →
          </a>
        )}
      </li>
    ))}
  </ul>
)

const DryResult: React.FC<{ result: RunPayload }> = ({ result }) => {
  const diff = result.diff ?? []
  const groups = new Map<string, VchlDiffEntry[]>()
  for (const d of diff) groups.set(d.entity, [...(groups.get(d.entity) ?? []), d])

  return (
    <section className={s.card}>
      <h2>Výsledek nanečisto</h2>
      <p className={s.muted}>
        {statusPill(result.status)} {describeChanges(result.changes)} · {result.requests} požadavků na AHL ·{' '}
        {(result.durationMs / 1000).toFixed(1).replace('.', ',')} s
      </p>
      {result.error && <Banner type="error">{result.error}</Banner>}
      {diff.length === 0 && !result.error && <p>Nic se nezmění, data v CMS odpovídají AHL.</p>}
      {[...groups.entries()].map(([entity, entries]) => (
        <div key={entity}>
          <h3 className={s.entityTitle}>
            {ENTITY_LABEL[entity] ?? entity} ({entries.length})
          </h3>
          <div className={s.scroll}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Akce</th>
                  <th>Položka</th>
                  <th>Měněná pole</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((d) => (
                  <DiffRow entry={d} key={d.key} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {result.warnings.length > 0 && (
        <>
          <h3 className={s.entityTitle}>Varování ({result.warnings.length})</h3>
          <WarningList warnings={result.warnings} />
        </>
      )}
    </section>
  )
}

const DiffRow: React.FC<{ entry: VchlDiffEntry }> = ({ entry }) => {
  const [open, setOpen] = useState(false)
  const hasDetail = entry.before !== undefined || entry.after !== undefined
  return (
    <>
      <tr
        aria-expanded={hasDetail ? open : undefined}
        className={hasDetail ? s.rowToggle : undefined}
        onClick={hasDetail ? () => setOpen((v) => !v) : undefined}
      >
        <td>
          <Pill pillStyle={entry.action === 'create' ? 'success' : 'light'} size="small">
            {entry.action === 'create' ? 'Nový' : 'Úprava'}
          </Pill>
        </td>
        <td>
          {hasDetail ? (open ? '▾ ' : '▸ ') : ''}
          {entry.label ?? entry.key}
        </td>
        <td className={s.mono}>{entry.fields.join(', ') || '—'}</td>
      </tr>
      {open && (
        <tr className={s.detail}>
          <td colSpan={3}>
            <div className={s.beforeAfter}>
              <div>
                <div className={s.muted}>Před</div>
                <pre className={s.pre}>{JSON.stringify(entry.before ?? null, null, 2)}</pre>
              </div>
              <div>
                <div className={s.muted}>Po</div>
                <pre className={s.pre}>{JSON.stringify(entry.after ?? null, null, 2)}</pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ------------------------------ Historie ------------------------------ */

const History: React.FC<{ runs: RunRow[] | null; sentryOrg: string | null }> = ({ runs, sentryOrg }) => {
  if (!runs) return <p className={s.muted}>Načítám…</p>
  if (runs.length === 0) return <p className={s.muted}>Zatím neproběhl žádný běh.</p>
  return (
    <section className={s.card}>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Čas</th>
              <th>Spouštěč</th>
              <th>Výsledek</th>
              <th>Trvání</th>
              <th>Požadavky</th>
              <th>Změny</th>
              <th>Varování</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <RunRowView key={r.id} run={r} sentryOrg={sentryOrg} />
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.muted}>Zobrazeno posledních {runs.length} běhů. Starší než 60 dní se mažou.</p>
    </section>
  )
}

const RunRowView: React.FC<{ run: RunRow; sentryOrg: string | null }> = ({ run, sentryOrg }) => {
  const [open, setOpen] = useState(false)
  const warnings = run.warnings ?? []
  const expandable = warnings.length > 0 || Boolean(run.error) || Boolean(run.sentryEventId)
  return (
    <>
      <tr
        aria-expanded={expandable ? open : undefined}
        className={expandable ? s.rowToggle : undefined}
        onClick={expandable ? () => setOpen((v) => !v) : undefined}
      >
        <td>
          {expandable ? (open ? '▾ ' : '▸ ') : ''}
          {fmtDate(run.startedAt)}
        </td>
        <td>{TRIGGER_LABEL[run.trigger] ?? run.trigger}</td>
        <td>{statusPill(run.status)}</td>
        <td>{fmtDuration(run.startedAt, run.finishedAt)}</td>
        <td>{run.requests ?? '—'}</td>
        <td>{totalChanges(run.changes) > 0 ? describeChanges(run.changes) : '—'}</td>
        <td>{warnings.length}</td>
      </tr>
      {open && (
        <tr className={s.detail}>
          <td colSpan={7}>
            {run.error && <pre className={`${s.pre} ${s.error}`}>{run.error}</pre>}
            {warnings.length > 0 && (
              <ul className={s.list} style={{ marginTop: run.error ? 8 : 0 }}>
                {warnings.map((w, i) => (
                  <li key={i}>
                    <Pill pillStyle="warning" size="small">
                      {WARNING_LABEL[w.type] ?? w.type}
                    </Pill>
                    <span>{w.message}</span>
                  </li>
                ))}
              </ul>
            )}
            {run.sentryEventId && (
              <p className={s.muted}>
                Sentry:{' '}
                {sentryOrg ? (
                  <a
                    href={`https://sentry.io/organizations/${encodeURIComponent(sentryOrg)}/issues/?query=${encodeURIComponent(run.sentryEventId)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    otevřít v Sentry
                  </a>
                ) : null}{' '}
                <span className={s.mono}>{run.sentryEventId}</span>
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

/* ------------------------------ Nastavení ------------------------------ */

const Settings: React.FC = () => {
  const [detect, setDetect] = useState<DetectPayload | null>(null)
  const [busy, setBusy] = useState<null | 'detect' | 'save'>(null)

  const call = async (save: boolean) => {
    setBusy(save ? 'save' : 'detect')
    try {
      const res = await api<DetectPayload>('detect', { method: 'POST', body: { save } })
      setDetect(res)
      if (save) toast.success('ID uložena do sezóny.')
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <section className={s.card}>
        <h2>Nastavení synchronizace</h2>
        <p className={s.muted}>
          Co se synchronizuje, jak často a komu chodí upozornění, se nastavuje v samostatném formuláři.
        </p>
        <div className={s.actions}>
          <Button buttonStyle="primary" el="link" size="medium" to="/admin/globals/vchl-sync">
            Otevřít nastavení
          </Button>
        </div>
      </section>

      <section className={s.card}>
        <h2>ID ročníku a týmu na AHL</h2>
        <p className={s.muted}>
          Mění se s každou sezónou. Prázdné hodnoty si job dohledá sám, tady je můžete zkontrolovat
          nebo přepsat podle toho, co ahl.cz ukazuje právě teď.
        </p>
        {detect && (
          <dl className={`${s.grid} ${s.stat}`}>
            <div className={s.stat}>
              <dt>Sezóna</dt>
              <dd>
                <a href={`/admin/collections/seasons/${detect.season.id}`}>{detect.season.title}</a>
              </dd>
            </div>
            <div className={s.stat}>
              <dt>ID ročníku</dt>
              <dd className={s.mono}>
                {detect.current.competitionYearId ?? '—'} → {detect.detected.competitionYearId}
              </dd>
            </div>
            <div className={s.stat}>
              <dt>ID týmu</dt>
              <dd className={s.mono}>
                {detect.current.participantId ?? '—'} → {detect.detected.participantId}
              </dd>
            </div>
          </dl>
        )}
        {detect && !detect.changed && <Banner type="success">Uložené hodnoty odpovídají AHL.</Banner>}
        <div className={s.actions}>
          <Button buttonStyle="secondary" disabled={busy !== null} onClick={() => call(false)} size="medium">
            {busy === 'detect' ? 'Hledám…' : 'Autodetekovat'}
          </Button>
          {detect && detect.changed && !detect.saved && (
            <Button buttonStyle="primary" disabled={busy !== null} onClick={() => call(true)} size="medium">
              Uložit do sezóny
            </Button>
          )}
          {detect && (
            <Button buttonStyle="subtle" el="link" size="medium" to={`/admin/collections/seasons/${detect.season.id}`}>
              Upravit sezónu
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
