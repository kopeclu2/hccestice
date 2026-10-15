import Image from 'next/image'
import React from 'react'

import { Badge } from '@/landing/ui/Badge'
import { DotEyebrow } from '@/landing/ui/DotEyebrow'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { getMediaUrl } from '@/lib/getMediaUrl'

import { MatchScoreboard } from '../components/MatchScoreboard'
import { NextMatchPanel } from '../components/NextMatchPanel'
import { OUTCOME_BADGE } from '../components/outcome'
import { formatCompetition } from '../data/matchFormat'
import type { MatchDetail, Photo } from '../types'

const SUFFIX_NOTE = { pp: 'po prodloužení', sn: 'po nájezdech' } as const

/**
 * Hlavička detailu zápasu — tři podoby podle stavu:
 *
 * - **odehraný**: tmavá výsledková tabule (`MatchScoreboard`, tatáž jako
 *   v hero reportáže) s logy týmů a řádkem základních údajů,
 * - **naplánovaný**: `NextMatchPanel` s odpočtem do buly,
 * - **zrušený**: tmavý panel bez skóre a bez odpočtu, s pilulkou „Zrušeno".
 *
 * Každá podoba nese `h1` stránky (u tabule jen pro čtečky — celou
 * informaci tam říká samotná tabule; odehraný zápas bez skóre ho ukáže
 * viditelně).
 */
export function MatchHeader({ match }: { match: MatchDetail }) {
  if (match.status === 'scheduled') return <ScheduledHeader match={match} />
  if (match.status === 'canceled') return <CanceledHeader match={match} />
  return <PlayedHeader match={match} />
}

/** „VČHL 2. ročník · Základní část“, ne surový text z AHL („2.ročník - ZČ“). */
const kicker = (match: MatchDetail): string => formatCompetition(match.competition) ?? 'VČHL'

/** Řádek údajů pod skóre / názvem: kdy, kde, jak to dopadlo. */
function Facts({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(11rem,100%),1fr))] gap-x-8 gap-y-3.5 md:gap-y-4">
      {children}
    </dl>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt>
        <Eyebrow tone="white">{label}</Eyebrow>
      </dt>
      <dd className="mt-1 text-sm font-semibold [overflow-wrap:anywhere] text-white md:text-base">
        {children}
      </dd>
    </div>
  )
}

function PlayedHeader({ match }: { match: MatchDetail }) {
  const outcome = match.outcome ? OUTCOME_BADGE[match.outcome] : null
  const note = match.suffix ? SUFFIX_NOTE[match.suffix] : null
  const hasScore = match.homeScore != null && match.awayScore != null

  return (
    <div className="relative overflow-hidden rounded-section bg-contrast px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.25rem,4vw,3.75rem)] text-on-contrast max-md:px-4.5 max-md:py-6">
      <div className="absolute inset-0 hatch opacity-40" />
      <div className="relative">
        <DotEyebrow>{kicker(match)}</DotEyebrow>

        {hasScore ? (
          <>
            {/* Titulek je tabule sama; `h1` je tu pro čtečky a vyhledávače. */}
            <h1 className="sr-only">
              {match.homeName} {match.homeScore}:{match.awayScore} {match.awayName}
            </h1>
            <MatchScoreboard
              logos={{ home: match.homeLogo, away: match.awayLogo }}
              scoreboard={{
                homeName: match.homeName,
                awayName: match.awayName,
                homeScore: match.homeScore!,
                awayScore: match.awayScore!,
                weAreHome: match.weAreHome,
                weWon: match.outcome === 'win',
                thirds: match.thirds,
                suffix: match.suffix,
              }}
            />
          </>
        ) : (
          // Odehraný zápas bez zapsaného skóre: tabuli není z čeho
          // vykreslit, takže titulek je vidět.
          <CardTitle as="h1" className="mt-3 leading-tight text-white" size="lg">
            {match.title}
          </CardTitle>
        )}

        <div className="my-[clamp(1.5rem,3vw,2.25rem)] h-px bg-white/16" />

        <Facts>
          <Fact label="Datum">
            {match.dateLabel} · {match.timeLabel}
          </Fact>
          {match.venue && <Fact label="Místo">{match.venue}</Fact>}
          {outcome && (
            <Fact label="Výsledek">
              <span className="flex flex-wrap items-center gap-2">
                <Badge size="sm" variant={outcome.variant}>
                  {outcome.label}
                </Badge>
                {note && <span className="text-xs font-medium text-white/65">{note}</span>}
              </span>
            </Fact>
          )}
        </Facts>
      </div>
    </div>
  )
}

/** Logo ve dvojici „Čestice × soupeř" — dekorace, jména jsou v nadpisu. */
function LogoPair({ away, home }: { away: Photo | null; home: Photo | null }) {
  const logos = [home, away].filter((logo): logo is Photo => Boolean(logo))
  if (logos.length === 0) return null
  return (
    <div aria-hidden className="mt-5 flex items-center gap-3">
      {logos.map((logo, index) => (
        <React.Fragment key={logo.url}>
          {index > 0 && <span className="text-white/40">×</span>}
          <Image
            alt=""
            className="size-12 rounded-full bg-white/90 object-contain p-1 md:size-14"
            height={56}
            src={getMediaUrl(logo.url, logo.updatedAt)}
            width={56}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

function ScheduledHeader({ match }: { match: MatchDetail }) {
  return (
    <NextMatchPanel
      kicker={`Nadcházející zápas · ${match.weAreHome ? 'Doma' : 'Venku'}`}
      kickoffISO={match.kickoffISO}
      layout="wide"
      meta={
        <>
          <LogoPair away={match.awayLogo} home={match.homeLogo} />
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Numeral className="text-white" size="md">
              {match.dateLabel}
            </Numeral>
            <span className="text-sm font-semibold text-white/70">{match.timeLabel}</span>
          </div>
        </>
      }
      radius="section"
      subtitle={[kicker(match), match.venue].filter(Boolean).join(' · ')}
      title={match.title}
      titleAs="h1"
    />
  )
}

function CanceledHeader({ match }: { match: MatchDetail }) {
  return (
    <div className="relative overflow-hidden rounded-section bg-contrast p-6 text-on-contrast md:p-8 lg:p-12">
      <div className="absolute inset-0 hatch opacity-40" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <Badge size="sm" variant="loss">
            Zrušeno
          </Badge>
          <Eyebrow tone="white">{kicker(match)}</Eyebrow>
        </div>
        <CardTitle as="h1" className="mt-3 leading-tight text-white" size="lg">
          {match.title}
        </CardTitle>
        <div className="mt-2 text-sm text-white/65">
          Plánovaný termín: {match.dateLabel} · {match.timeLabel}
          {match.venue ? ` · ${match.venue}` : ''}
        </div>
        <LogoPair away={match.awayLogo} home={match.homeLogo} />
      </div>
    </div>
  )
}
