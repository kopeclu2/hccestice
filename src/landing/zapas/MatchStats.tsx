import React from 'react'

import { Eyebrow } from '../components/Kicker'
import { Numeral } from '../components/Numeral'
import type { MatchStatRow } from '../types'

import { MatchPanel } from './MatchPanel'

/**
 * Statistika zápasu v pořadí Čestice : soupeř (tak ji ukládá CMS).
 *
 * Poměrový pruh se kreslí jen u čísel; čas v přesilovce je text „m:ss"
 * a jeho převod na vteřiny kvůli pruhu by přidal parser pro jediný řádek.
 * Pruh je čistě dekorace (`aria-hidden`) — obě čísla stojí v textu.
 * Když jsou obě hodnoty nula, pruh zůstane prázdný, ne 50 : 50, které
 * by tvrdilo vyrovnanost tam, kde se nic nestalo.
 */
export function MatchStats({
  opponentName,
  rows,
}: {
  opponentName: string
  rows: MatchStatRow[]
}) {
  if (rows.length === 0) return null

  return (
    <MatchPanel id="zapas-statistika" title="Statistika">
      <div className="mt-4 flex justify-between gap-4">
        <Eyebrow className="min-w-0" tone="club">
          HC Čestice
        </Eyebrow>
        <Eyebrow className="min-w-0 text-right">{opponentName}</Eyebrow>
      </div>

      <ul className="mt-3 space-y-5">
        {rows.map((row) => (
          <li key={row.label}>
            {/* Vizuálně jsou čísla po stranách popisku; čtečka by slyšela jen
                „3 Vyloučení 4", proto stejnou informaci čte celou větou. */}
            <span className="sr-only">
              {row.label}: HC Čestice {row.ours}, {opponentName} {row.opp}
            </span>
            <div aria-hidden className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-x-3">
              <Numeral size="sm">{row.ours}</Numeral>
              <span className="text-faint text-center text-caption font-bold text-balance">
                {row.label}
              </span>
              <Numeral className="text-right" size="sm">
                {row.opp}
              </Numeral>
            </div>
            <RatioBar opp={row.oppValue} ours={row.oursValue} />
          </li>
        ))}
      </ul>
    </MatchPanel>
  )
}

function RatioBar({ opp, ours }: { opp: number | null; ours: number | null }) {
  if (ours == null || opp == null) return null
  const total = ours + opp
  const share = total > 0 ? (ours / total) * 100 : 0

  return (
    <div aria-hidden className="bg-chip mt-2 flex h-1.5 overflow-hidden rounded-full">
      {total > 0 && (
        <>
          <div className="bg-club" style={{ width: `${share}%` }} />
          <div className="bg-line-mid flex-1" />
        </>
      )}
    </div>
  )
}
