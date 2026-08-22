import type { MatchCardBlock } from '@/payload-types'

import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import type { MatchCardData, Photo } from '../../types'

import { Kicker } from '../../components/Kicker'
import { Numeral } from '../../components/Numeral'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchMatchCard } from '../../data/matches'

/** Velká karta zápasu — loga, skóre / termín, odkaz na reportáž. */
export async function MatchCardBlockComponent({ block }: { block: MatchCardBlock }) {
  const matchId = relId(block.match)
  if (!matchId) return null
  const match = await fetchMatchCard(matchId)
  if (!match) return null
  return <MatchCardView kicker={block.kicker ?? null} match={match} />
}

function MatchCardView({ match, kicker }: { match: MatchCardData; kicker: string | null }) {
  const our = { name: 'HC Čestice', logo: '/logo-cestice.png' }
  const left = match.home ? 'ours' : 'theirs'

  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto max-w-180 rounded-card bg-surface p-4.5 text-center md:p-7.5 lg:p-10">
          {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
          <div className="text-faint text-meta font-semibold">
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
                    'rounded-2xl px-5 py-2.5 md:text-numeral-2xl',
                    match.won ? 'bg-lime text-ink' : 'bg-chip text-ink',
                  )}
                  size="xl"
                >
                  {match.score}
                  {match.suffix && (
                    <span className="text-faint ml-1.5 text-body font-bold">{match.suffix}</span>
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

          {match.reportHref && (
            <Link
              className="text-club hover:text-club-dark mt-6 inline-flex items-center gap-2 text-meta font-bold"
              href={match.reportHref}
            >
              Reportáž ze zápasu <ArrowUpRight className="size-4" strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}

function TeamSide({ logo, name }: { logo: Photo | string | null; name: string }) {
  const src = typeof logo === 'string' ? logo : logo ? getMediaUrl(logo.url) : null
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
        <div className="bg-chip size-16 rounded-full md:size-20" />
      )}
      <div className="text-meta leading-tight font-extrabold md:text-body">{name}</div>
    </div>
  )
}
