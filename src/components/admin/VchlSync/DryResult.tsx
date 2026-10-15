'use client'

import { Banner, Pill } from '@payloadcms/ui'
import React, { useState } from 'react'

import { describeChanges, ENTITY_LABEL } from './format'
import { StatusPill, WarningList } from './shared'
import s from './styles.module.css'
import type { RunPayload, VchlDiffEntry } from './types'

export const DryResult: React.FC<{ result: RunPayload }> = ({ result }) => {
  const diff = result.diff ?? []
  const groups = new Map<string, VchlDiffEntry[]>()
  for (const d of diff) groups.set(d.entity, [...(groups.get(d.entity) ?? []), d])

  return (
    <section className={s.card}>
      <h2>Výsledek nanečisto</h2>
      <p className={s.muted}>
        <StatusPill status={result.status} /> {describeChanges(result.changes)} · {result.requests}{' '}
        požadavků na AHL · {(result.durationMs / 1000).toFixed(1).replace('.', ',')} s
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
