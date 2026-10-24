import React from 'react'

import type { MatchPenaltyRow } from '@/landing/features/matches/types'
import { Badge } from '@/landing/ui/Badge'

import { MatchPanel } from './MatchPanel'

/** Od kolika minut je trest „vyšší" (5, osobní 10, do konce utkání 20) — cihlový štítek. */
const MAJOR_MINUTES = 5

/**
 * Tresty HC Čestice v jednom zápase — čas, hráč, minuty, druh a důvod,
 * v hlavičce součet trestných minut. Widget v článku (blok `matchPenalties`).
 * Soupeřovy tresty zápis do CMS neukládá. Bez trestů se nevykreslí.
 */
export function MatchPenalties({
  id,
  minutes,
  rows,
  title,
}: {
  /** Unikátní `id` nadpisu (víc widgetů na jedné stránce). */
  id: string
  /** Součet trestných minut. */
  minutes: number
  rows: MatchPenaltyRow[]
  title: string
}) {
  if (rows.length === 0) return null

  return (
    <MatchPanel
      aside={
        <Badge size="sm" variant="chip">
          {`${minutes} `}
          <span aria-hidden>TM</span>
          <span className="sr-only">trestných minut celkem</span>
        </Badge>
      }
      id={id}
      title={title}
      titleAs="h3"
    >
      <ol className="mt-4 divide-y divide-line-soft">
        {rows.map((row, index) => {
          const major = (row.minutes ?? 0) >= MAJOR_MINUTES
          return (
            <li
              className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-3 py-3 md:grid-cols-[3.25rem_minmax(0,1fr)_auto]"
              key={`${row.time}-${index}`}
            >
              <span className="text-xs font-semibold text-faint tabular-nums">{row.time}</span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-pretty break-words md:text-base">
                  {row.player}
                </div>
                {(row.kind || row.reason) && (
                  <div className="mt-0.5 text-xs font-medium text-pretty break-words text-faint">
                    {[row.kind, row.reason].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              {row.minutes != null && (
                <Badge className="tabular-nums" size="xs" variant={major ? 'loss' : 'chip'}>
                  {row.minutes}&nbsp;min
                </Badge>
              )}
            </li>
          )
        })}
      </ol>
    </MatchPanel>
  )
}
