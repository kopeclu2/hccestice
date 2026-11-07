import Link from 'next/link'
import React from 'react'

import { isOurTeam } from '@/ahl/ourTeam'
import { Button } from '@/components/ui/button'
import type { StandingsContent } from '@/landing/features/matches/types'
import { EmptyState } from '@/landing/ui/EmptyState'
import { CardTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { cn } from '@/lib/utils'

const ZAPASY_HREF = '/zapasy'

/** Mřížka řádku; V / VP / PP / P (`STAT`) naskočí od `sm`, na úzkém displeji by sežraly název týmu. */
const GRID_BASE =
  'grid-cols-[1.5rem_1fr_1.75rem_2rem] md:grid-cols-[2rem_1fr_2.5rem_2.5rem] md:gap-3'
const GRID_EXTENDED =
  'grid-cols-[1.5rem_1fr_1.75rem_2rem] sm:grid-cols-[1.5rem_1fr_1.75rem_1.75rem_1.75rem_1.75rem_1.75rem_2rem] md:grid-cols-[2rem_1fr_2.5rem_2.25rem_2.25rem_2.25rem_2.25rem_2.5rem] md:gap-3'
const STAT = 'hidden text-center sm:block'

/** Tabulka VČHL — řádek HC Čestice zvýrazněný zeleně (sdílí ji widget Tabulka). */
export function StandingsCard({ standings }: { standings: StandingsContent }) {
  // Rozšířené sloupce jen když je mají všechny řádky (ručně vedené sezóny ne).
  const extended =
    standings.rows.length > 0 &&
    standings.rows.every((row) => row.wins != null && row.otLosses != null && row.losses != null)
  const gridCols = extended ? GRID_EXTENDED : GRID_BASE

  return (
    <div className="relative h-full overflow-hidden rounded-card bg-surface p-4.5 md:p-7 lg:p-9">
      <div className="mb-3.5 flex items-baseline gap-3">
        <CardTitle as="h3" size="md">
          Tabulka <Highlight>VČHL</Highlight>
        </CardTitle>
        <span className="text-xs text-faint">{standings.seasonLabel}</span>
      </div>

      {standings.rows.length === 0 ? (
        <EmptyState
          actions={
            <Button asChild size="sm" variant="dark" withArrow>
              <Link href={ZAPASY_HREF}>Rozlosování</Link>
            </Button>
          }
          frame="bare"
          title="Tabulka zatím neběží"
          titleAs="h3"
          watermark="VČHL"
        >
          Naplní se, jakmile odehrajeme první zápasy sezóny.
        </EmptyState>
      ) : (
        <>
          {/* Sémantická tabulka, vzhled drží `display: grid` na řádcích; role jsou
              zapsané výslovně, protože Safari při změně `display` sémantiku zahodí. */}
          <table className="block w-full" role="table">
            <caption className="sr-only">{`Tabulka soutěže: ${standings.seasonLabel}`}</caption>
            <thead className="block" role="rowgroup">
              <tr
                className={cn(
                  'grid items-center gap-2 border-b border-line-soft pb-2 text-eyebrow font-bold tracking-caps-lg text-faint uppercase',
                  gridCols,
                )}
                role="row"
              >
                <th className="text-left font-bold" role="columnheader" scope="col">
                  <abbr className="no-underline" title="Pořadí">
                    #
                  </abbr>
                </th>
                <th className="text-left font-bold" role="columnheader" scope="col">
                  Tým
                </th>
                <th className="text-right font-bold" role="columnheader" scope="col">
                  <abbr className="no-underline" title="Zápasy">
                    Z
                  </abbr>
                </th>
                {extended && (
                  <>
                    <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                      <abbr className="no-underline" title="Výhry">
                        V
                      </abbr>
                    </th>
                    <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                      <abbr className="no-underline" title="Výhry po prodloužení nebo nájezdech">
                        VP
                      </abbr>
                    </th>
                    <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                      <abbr className="no-underline" title="Prohry po prodloužení nebo nájezdech">
                        PP
                      </abbr>
                    </th>
                    <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                      <abbr className="no-underline" title="Prohry">
                        P
                      </abbr>
                    </th>
                  </>
                )}
                <th className="text-right font-bold" role="columnheader" scope="col">
                  <abbr className="no-underline" title="Body">
                    B
                  </abbr>
                </th>
              </tr>
            </thead>
            <tbody className="block" role="rowgroup">
              {standings.rows.map((row) => {
                const isOurs = isOurTeam(row.team)
                return (
                  <tr
                    className={cn(
                      /* Na mobilu užší pevné sloupce a menší mezera: s desktopovými
                         hodnotami (32+40+40 px a gap-3) zbylo na název týmu tak málo,
                         že se „HC Spartak Choceň B" lámalo na čtyři řádky. */
                      'grid items-center gap-2 border-b border-line-soft py-2.75',
                      gridCols,
                      isOurs && 'bg-tint',
                    )}
                    key={row.pos}
                    role="row"
                  >
                    <td
                      className={cn('text-sm font-bold', isOurs ? 'text-ink' : 'text-faint')}
                      role="cell"
                    >
                      {row.pos}.
                    </td>
                    <th
                      className={cn(
                        'text-left text-sm md:text-base',
                        isOurs ? 'font-bold' : 'font-medium',
                      )}
                      role="rowheader"
                      scope="row"
                    >
                      {row.team}
                    </th>
                    <td className="text-right text-sm text-faint tabular-nums" role="cell">
                      {row.games}
                    </td>
                    {extended && (
                      <>
                        <td className={cn(STAT, 'text-sm text-faint tabular-nums')} role="cell">
                          {row.wins}
                        </td>
                        <td className={cn(STAT, 'text-sm text-faint tabular-nums')} role="cell">
                          {row.otWins ?? 0}
                        </td>
                        <td className={cn(STAT, 'text-sm text-faint tabular-nums')} role="cell">
                          {row.otLosses}
                        </td>
                        <td className={cn(STAT, 'text-sm text-faint tabular-nums')} role="cell">
                          {row.losses}
                        </td>
                      </>
                    )}
                    <td className="text-right text-sm font-bold md:text-base" role="cell">
                      {row.points}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="mt-3 text-xs leading-relaxed text-faint">
            <b className="font-bold text-ink-soft">Z</b> zápasy
            {extended && (
              <span className="max-sm:hidden">
                {' · '}
                <b className="font-bold text-ink-soft">V</b> výhry
                {' · '}
                <b className="font-bold text-ink-soft">VP</b> výhry po prodloužení nebo nájezdech
                {' · '}
                <b className="font-bold text-ink-soft">PP</b> prohry po prodloužení nebo nájezdech
                {' · '}
                <b className="font-bold text-ink-soft">P</b> prohry
              </span>
            )}
            {' · '}
            <b className="font-bold text-ink-soft">B</b> body
          </p>

          <a
            className="mt-3.5 inline-block text-sm font-semibold text-club-dark hover:text-club"
            href={standings.fullTableUrl}
            rel="noreferrer"
            target="_blank"
          >
            Celá tabulka na ahl.cz ↗
          </a>
        </>
      )}
    </div>
  )
}
