import Link from 'next/link'
import React from 'react'

import { MatchScoreboard } from '@/landing/features/matches/components/MatchScoreboard'
import type { MatchDetail } from '@/landing/features/matches/types'
import { competitionLabel } from '@/landing/features/matches/view/matchFormat'
import { DotEyebrow } from '@/landing/ui/DotEyebrow'
import { routes } from '@/lib/routes'

/**
 * Tmavá tabule se skóre, třetinami a stavem zápasu pro widget v článku
 * (blok `matchScoreboard`) — tatáž `MatchScoreboard` jako v hlavičce detailu,
 * jen bez `h1` (nadpisem je článek) a bez řádku údajů. Pod tabulí odkaz na
 * detail zápasu. Zápas bez skóre (naplánovaný, zrušený) tabuli nemá a
 * vrací `null`.
 */
export function MatchScoreboardPanel({ match }: { match: MatchDetail }) {
  if (match.homeScore == null || match.awayScore == null) return null

  return (
    <div className="relative overflow-hidden rounded-section bg-contrast px-panel py-panel-y text-on-contrast max-md:px-4.5 max-md:py-6">
      <div className="absolute inset-0 hatch opacity-40" />
      <div className="relative">
        <DotEyebrow>{competitionLabel(match)}</DotEyebrow>
        <MatchScoreboard
          logos={{ home: match.homeLogo, away: match.awayLogo }}
          scoreboard={{
            homeName: match.homeName,
            awayName: match.awayName,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            weAreHome: match.weAreHome,
            weWon: match.outcome === 'win',
            thirds: match.thirds,
            suffix: match.suffix,
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-medium text-on-contrast-muted">
          <span>
            {match.dateLabel}
            {match.venue && ` · ${match.venue}`}
          </span>
          {match.slug && (
            <Link
              className="font-semibold text-on-contrast underline underline-offset-2 hover:text-lime"
              href={routes.match(match.slug)}
            >
              Detail zápasu
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
