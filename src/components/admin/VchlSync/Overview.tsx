'use client'

import { Button, Pill } from '@payloadcms/ui'
import React from 'react'

import { DryResult } from './DryResult'
import { describeChanges, fmtDate, fmtRelative } from './format'
import { StatusPill, WarningList } from './shared'
import s from './styles.module.css'
import type { RunPayload, StatusPayload } from './types'

/** Která akce tlačítek na přehledu právě běží. */
export type OverviewBusy = 'run' | 'dry' | 'toggle'

export const Overview: React.FC<{
  busy: OverviewBusy | null
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
        <dl className={`${s.grid} ${s.stat} ${s.flush}`}>
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
                  <StatusPill status={last.status} />
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
          <Button
            buttonStyle="primary"
            disabled={working}
            onClick={() => onRun(false)}
            size="medium"
          >
            {busy === 'run' ? 'Synchronizuji…' : 'Spustit teď'}
          </Button>
          <Button
            buttonStyle="secondary"
            disabled={working}
            onClick={() => onRun(true)}
            size="medium"
          >
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
