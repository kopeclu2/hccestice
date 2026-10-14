import React from 'react'

import { Badge } from '../components/Badge'
import type { MatchPenaltyRow } from '../types'

import { MatchPanel } from './MatchPanel'

/**
 * Tresty HC Čestice. Soupeřovy tresty zápis do CMS neukládá (viz AGENTS.md
 * → Synchronizace VČHL), proto je nadpis explicitní — blok o „trestech
 * v zápase" by sliboval víc, než ukazuje.
 *
 * Druh a důvod jsou druhý řádek pod jménem, ne vlastní sloupce: na 320px
 * displeji by pět sloupců (čas, hráč, druh, důvod, minuty) nevyšlo a
 * „Nedovolené bránění" by se lámalo po písmenech.
 */
export function PenaltiesSummary({
  minutes,
  rows,
}: {
  minutes: number
  rows: MatchPenaltyRow[]
}) {
  if (rows.length === 0) return null

  return (
    <MatchPanel
      aside={
        <Badge size="sm" variant="chip">
          Celkem {minutes} min
        </Badge>
      }
      id="zapas-tresty"
      title="Tresty HC Čestice"
    >
      <ul className="divide-line-soft mt-4 divide-y">
        {rows.map((row, index) => {
          const detail = [row.kind, row.reason].filter(Boolean).join(' · ')
          return (
            <li
              className="grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-3 py-3 md:grid-cols-[3.25rem_1fr_auto] md:gap-x-4"
              key={`${row.time}-${row.player}-${index}`}
            >
              <span className="text-faint text-caption font-bold tabular-nums">{row.time}</span>
              <div className="min-w-0">
                <div className="text-body font-extrabold [overflow-wrap:anywhere]">
                  {row.player}
                </div>
                {detail && (
                  <div className="text-faint mt-0.5 text-caption font-semibold text-pretty [overflow-wrap:anywhere]">
                    {detail}
                  </div>
                )}
              </div>
              {row.minutes != null && (
                <span className="text-meta font-extrabold whitespace-nowrap tabular-nums">
                  {row.minutes} min
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </MatchPanel>
  )
}
