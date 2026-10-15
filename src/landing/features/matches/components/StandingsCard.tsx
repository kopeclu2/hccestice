import React from 'react'

import { isOurTeam } from '@/ahl/ourTeam'
import type { StandingsContent } from '@/landing/features/matches/types'
import { EmptyState } from '@/landing/ui/EmptyState'
import { CardTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PillLink } from '@/landing/ui/PillLink'
import { cn } from '@/lib/utils'

const ZAPASY_HREF = '/zapasy'

/** Tabulka VČHL — řádek HC Čestice zvýrazněný zeleně (sdílí ji widget Tabulka). */
export function StandingsCard({ standings }: { standings: StandingsContent }) {
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
            <PillLink href={ZAPASY_HREF} size="sm" variant="dark" withArrow>
              Rozlosování
            </PillLink>
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
          {standings.rows.map((row) => {
            const isOurs = isOurTeam(row.team)
            return (
              <div
                className={cn(
                  /* Na mobilu užší pevné sloupce a menší mezera: s desktopovými
                     hodnotami (32+40+40 px a gap-3) zbylo na název týmu tak málo,
                     že se „HC Spartak Choceň B" lámalo na čtyři řádky. */
                  'grid grid-cols-[1.5rem_1fr_1.75rem_2rem] items-center gap-2 border-b border-line-soft py-2.75 md:grid-cols-[2rem_1fr_2.5rem_2.5rem] md:gap-3',
                  isOurs && 'bg-tint',
                )}
                key={row.pos}
              >
                <div className={cn('text-sm font-bold', isOurs ? 'text-club-dark' : 'text-faint')}>
                  {row.pos}.
                </div>
                <div className={cn('text-sm md:text-base', isOurs ? 'font-bold' : 'font-medium')}>
                  {row.team}
                </div>
                <div className="text-right text-sm text-faint">{row.games}</div>
                <div className="text-right text-sm font-bold md:text-base">{row.points}</div>
              </div>
            )
          })}

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
