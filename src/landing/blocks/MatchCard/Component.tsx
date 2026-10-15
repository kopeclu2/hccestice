import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { fetchMatchCard } from '@/landing/features/matches/data/matches'
import type { MatchCardData } from '@/landing/features/matches/types'
import { relId } from '@/landing/lib/payload'
import type { Photo } from '@/landing/types'
import { Kicker } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { CLUB_LOGO, CLUB_NAME } from '@/lib/club'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'
import type { MatchCardBlock } from '@/payload-types'

/** Velká karta zápasu — loga, skóre / termín, odkaz na reportáž. */
export async function MatchCardBlockComponent({ block }: { block: MatchCardBlock }) {
  const matchId = relId(block.match)
  if (!matchId) return null
  const match = await fetchMatchCard(matchId)
  if (!match) return null
  return <MatchCardView kicker={block.kicker ?? null} match={match} />
}

function MatchCardView({ match, kicker }: { match: MatchCardData; kicker: string | null }) {
  const our = { name: CLUB_NAME, logo: CLUB_LOGO }
  const left = match.home ? 'ours' : 'theirs'

  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto max-w-180 rounded-card bg-surface p-4.5 text-center md:p-7.5 lg:p-10">
          {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
          <div className="text-sm font-medium text-faint">
            {[match.dateLabel, match.competition, match.venue].filter(Boolean).join(' · ')}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
            <TeamSide
              logo={left === 'ours' ? our.logo : match.opponentLogo}
              name={left === 'ours' ? our.name : match.opponentName}
            />
            <div>
              {match.score ? (
                <Numeral
                  as="div"
                  className={cn(
                    'rounded-icon px-5 py-2.5 md:text-5xl',
                    match.won ? 'bg-lime text-ink' : 'bg-chip text-ink',
                  )}
                  size="xl"
                >
                  {match.score}
                  {match.suffix && (
                    <span className="ml-1.5 text-sm font-semibold text-faint md:text-base">
                      {match.suffix}
                    </span>
                  )}
                </Numeral>
              ) : (
                <Numeral as="div" className="text-faint" size="sm">
                  vs
                </Numeral>
              )}
            </div>
            <TeamSide
              logo={left === 'ours' ? match.opponentLogo : our.logo}
              name={left === 'ours' ? match.opponentName : our.name}
            />
          </div>

          {(match.reportHref || match.href) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {match.reportHref && (
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-club-dark hover:text-club"
                  href={match.reportHref}
                >
                  Reportáž ze zápasu <ArrowUpRight className="size-4" strokeWidth={2.5} />
                </Link>
              )}
              {match.href && (
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-club-dark hover:text-club"
                  href={match.href}
                >
                  Detail zápasu <ArrowUpRight className="size-4" strokeWidth={2.5} />
                </Link>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}

function TeamSide({ logo, name }: { logo: Photo | string | null; name: string }) {
  const src = typeof logo === 'string' ? logo : logo ? getMediaUrl(logo.url, logo.updatedAt) : null
  return (
    <div className="flex flex-col items-center gap-2.5">
      {src ? (
        <Image
          alt={name}
          className="size-16 object-contain md:size-20"
          height={80}
          src={src}
          width={80}
        />
      ) : (
        <div className="size-16 rounded-full bg-chip md:size-20" />
      )}
      <div className="text-sm leading-tight font-bold md:text-base">{name}</div>
    </div>
  )
}
