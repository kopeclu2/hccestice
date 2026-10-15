'use client'

import { Pill } from '@payloadcms/ui'
import React, { useState } from 'react'

import {
  describeChanges,
  fmtDate,
  fmtDuration,
  totalChanges,
  TRIGGER_LABEL,
  WARNING_LABEL,
} from './format'
import { StatusPill } from './shared'
import s from './styles.module.css'
import type { RunRow } from './types'

export const History: React.FC<{ runs: RunRow[] | null; sentryOrg: string | null }> = ({
  runs,
  sentryOrg,
}) => {
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
      <p className={s.muted}>
        Zobrazeno posledních {runs.length} běhů. Starší než 60 dní se mažou.
      </p>
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
        <td>
          <StatusPill status={run.status} />
        </td>
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
              <ul className={`${s.list} ${run.error ? s.listAfterError : ''}`}>
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
