import React from 'react'

import type {
  LineupRow,
  MatchLineup as MatchLineupData,
} from '@/landing/features/matches/view/matchLineup'
import { Eyebrow } from '@/landing/ui/Kicker'
import { cn } from '@/lib/utils'

import { MatchPanel } from './MatchPanel'

/** Číselná buňka tabulky: úzká, zarovnaná vpravo, tabulkové číslice. */
const NUM = 'w-9 text-right tabular-nums'

/**
 * Soupiska HC Čestice v jednom zápase: hráči v poli (číslo, jméno, G, A, B,
 * TM) a pod nimi brankáři zvlášť. Widget v článku (blok `matchLineup`).
 *
 * Statistické sloupce brankářů se ukážou, jen když v nich něco je (asistence,
 * trest) — jinak by byly samé nuly. Jména jsou text; odkaz na profil hráče
 * záměrně není (soupiska nese jméno ze zápisu, ne vždy spárovaného hráče).
 */
export function MatchLineup({
  id,
  lineup,
  title,
}: {
  /** Unikátní `id` nadpisu (víc widgetů na jedné stránce). */
  id: string
  lineup: MatchLineupData
  title: string
}) {
  const { skaters, goalies } = lineup
  const goaliesHaveStats = goalies.some((row) => row.goals + row.assists + row.pim > 0)

  return (
    <MatchPanel id={id} title={title} titleAs="h3">
      <div className="mt-4 space-y-6">
        {skaters.length > 0 && <LineupTable caption="Hráči v poli" rows={skaters} showStats />}
        {goalies.length > 0 && (
          <LineupTable caption="Brankáři" rows={goalies} showStats={goaliesHaveStats} />
        )}
      </div>
    </MatchPanel>
  )
}

function LineupTable({
  caption,
  rows,
  showStats,
}: {
  caption: string
  rows: LineupRow[]
  showStats: boolean
}) {
  return (
    <div>
      <h4>
        <Eyebrow tone="club">{caption}</Eyebrow>
      </h4>
      <table className="mt-2 w-full text-sm md:text-base">
        <caption className="sr-only">
          {showStats
            ? `${caption} HC Čestice: číslo, jméno, góly, asistence, body a trestné minuty`
            : `${caption} HC Čestice: číslo a jméno`}
        </caption>
        <thead>
          <tr className="text-xs font-semibold text-faint">
            <th className="w-10 py-1.5 text-left font-semibold" scope="col">
              <abbr className="no-underline" title="Číslo dresu">
                č.
              </abbr>
            </th>
            <th className="py-1.5 text-left font-semibold" scope="col">
              Hráč
            </th>
            {showStats && (
              <>
                <Head abbr="G" title="Góly" />
                <Head abbr="A" title="Asistence" />
                <Head abbr="B" title="Body" />
                <Head abbr="TM" title="Trestné minuty" />
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft border-t border-line-soft">
          {rows.map((row, index) => (
            <tr key={`${row.number ?? 'x'}-${row.name}-${index}`}>
              <td className="py-2 pr-2 text-xs font-semibold text-faint tabular-nums">
                {row.number ?? ''}
              </td>
              <th className="py-2 pr-2 text-left font-semibold break-words" scope="row">
                {row.name}
              </th>
              {showStats && (
                <>
                  <td className={cn(NUM, 'font-semibold text-ink-soft')}>{row.goals}</td>
                  <td className={cn(NUM, 'font-semibold text-ink-soft')}>{row.assists}</td>
                  <td className={cn(NUM, 'font-extrabold')}>{row.points}</td>
                  <td className={cn(NUM, 'font-semibold text-ink-soft')}>{row.pim}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Head({ abbr, title }: { abbr: string; title: string }) {
  return (
    <th className={cn(NUM, 'font-semibold')} scope="col">
      <abbr className="no-underline" title={title}>
        {abbr}
      </abbr>
    </th>
  )
}
