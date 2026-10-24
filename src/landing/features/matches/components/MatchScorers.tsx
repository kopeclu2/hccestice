import React from 'react'

import { SPECIAL } from '@/landing/features/matches/components/MatchTimeline'
import type { ScorerRow } from '@/landing/features/matches/view/matchScorers'
import { Badge } from '@/landing/ui/Badge'
import { countLabel } from '@/lib/plural'

import { MatchPanel } from './MatchPanel'

/**
 * Střelci HC Čestice v jednom zápase — čas, stav po brance, střelec,
 * asistence a PP / OS / SN. Widget v článku (blok `matchScorers`); typografie
 * podle tabulky v `MatchPanel`. Bez branek se nevykreslí.
 */
export function MatchScorers({
  id,
  rows,
  title,
}: {
  /** Unikátní `id` nadpisu (víc widgetů na jedné stránce). */
  id: string
  rows: ScorerRow[]
  title: string
}) {
  if (rows.length === 0) return null

  return (
    <MatchPanel
      aside={
        <Badge size="sm" variant="chip">
          {countLabel(rows.length, ['gól', 'góly', 'gólů'])}
        </Badge>
      }
      id={id}
      title={title}
      titleAs="h3"
    >
      <ol className="mt-4 divide-y divide-line-soft">
        {rows.map((row, index) => {
          const special = row.special ? SPECIAL[row.special] : null
          return (
            <li
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3 py-3 md:grid-cols-[3.25rem_minmax(0,1fr)]"
              key={`${row.time}-${index}`}
            >
              <span className="text-xs font-semibold text-faint tabular-nums">{row.time}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="min-w-0 text-sm font-bold text-pretty break-words md:text-base">
                    {row.scorer}
                  </span>
                  {special && (
                    <Badge
                      className="px-2 py-0.5"
                      size="xs"
                      variant={row.special === 'sn' ? 'outline' : 'chip'}
                    >
                      <span aria-hidden>{special.label}</span>
                      <span className="sr-only">{special.title}</span>
                    </Badge>
                  )}
                  {row.score && (
                    <span className="text-xs font-semibold text-faint tabular-nums">
                      <span className="sr-only">stav </span>
                      {row.score}
                    </span>
                  )}
                </div>
                {row.assists.length > 0 && (
                  <div className="mt-0.5 text-xs font-medium text-pretty break-words text-faint">
                    <span className="sr-only">Asistence: </span>
                    <span aria-hidden>(</span>
                    {row.assists.join(', ')}
                    <span aria-hidden>)</span>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </MatchPanel>
  )
}
