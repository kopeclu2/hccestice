import React from 'react'

import { MatchMeta } from '@/landing/features/matches/components/MatchMeta'
import { OUTCOME_BADGE } from '@/landing/features/matches/components/outcome'
import { TeamCrest } from '@/landing/features/matches/components/TeamCrest'
import type { MatchDetail } from '@/landing/features/matches/types'
import { competitionLabel, outcomeNote } from '@/landing/features/matches/view/matchFormat'
import { Badge } from '@/landing/ui/Badge'
import { Eyebrow } from '@/landing/ui/Kicker'
import { cn } from '@/lib/utils'

import {
  hasScore,
  type HeaderVariantProps,
  ourSide,
  periodColumns,
  SrTitle,
  weekday,
  winnerSide,
} from './shared'
import { VariantCountdown } from './VariantCountdown'

/**
 * Varianta C — „Půlené pole". Karta rozdělená šikmým švem na domácí
 * a hosty. Vyplněná polovina je vítěz — klubová zelená, když vyhrály
 * Čestice, tmavá s lime číslem, když soupeř; poražený zůstává na bílé.
 * Skóre stojí u švu, na švu „pečeť" s PP/SN. Kdo vyhrál, je čitelné
 * dřív, než se přečte jediné číslo.
 *
 * Šev je jeden `linear-gradient` přes celou kartu (pod `md` skoro
 * vodorovný, polovinami jsou řádky; od `md` svislý pod úhlem 100°).
 * Obsah polovin si drží odstup od švu odsazením, takže na něj nesahá.
 */
type Fill = 'club' | 'contrast' | 'surface' | 'tint' | 'paper'

const FILL_VAR: Record<Fill, string> = {
  club: 'var(--color-club)',
  contrast: 'var(--color-contrast)',
  surface: 'var(--color-surface)',
  tint: 'var(--color-tint)',
  paper: 'var(--color-paper-mid)',
}

const fills = (match: MatchDetail): { home: Fill; away: Fill } => {
  const winner = winnerSide(match)
  const ours = ourSide(match)
  if (match.status !== 'played' || winner === null) {
    // Naplánovaný zápas: naše polovina v klubové barvě, soupeř bílý.
    return ours === 'home' ? { home: 'club', away: 'surface' } : { home: 'surface', away: 'club' }
  }
  if (winner === 'draw') return { home: 'paper', away: 'surface' }
  const winFill: Fill = winner === ours ? 'club' : 'contrast'
  return winner === 'home' ? { home: winFill, away: 'surface' } : { home: 'surface', away: winFill }
}

export function HeaderSplit({ match, titleAs = 'h1' }: HeaderVariantProps) {
  const { home, away } = fills(match)
  const played = match.status === 'played' && hasScore(match)
  const winner = winnerSide(match)

  const style = { '--home': FILL_VAR[home], '--away': FILL_VAR[away] } as React.CSSProperties

  return (
    <div className="relative isolate overflow-hidden rounded-card border border-line-mid bg-surface">
      <SrTitle as={titleAs} match={match} />

      <div
        aria-hidden
        className="relative grid bg-[linear-gradient(174deg,var(--home)_calc(50%-0.5px),var(--away)_calc(50%+0.5px))] md:grid-cols-2 md:bg-[linear-gradient(100deg,var(--home)_calc(50%-0.5px),var(--away)_calc(50%+0.5px))]"
        style={style}
      >
        <Half
          fill={home}
          logo={match.homeLogo}
          name={match.homeName}
          point={played && match.outcome === 'otLoss' && ourSide(match) === 'home'}
          score={played ? match.homeScore : null}
          side="home"
          won={winner === 'home'}
        />
        <Half
          fill={away}
          logo={match.awayLogo}
          name={match.awayName}
          point={played && match.outcome === 'otLoss' && ourSide(match) === 'away'}
          score={played ? match.awayScore : null}
          side="away"
          won={winner === 'away'}
        />
        <Seal label={played ? match.suffix || null : 'vs'} />
      </div>

      <Footer match={match} played={played} />
    </div>
  )
}

const TEXT: Record<Fill, { name: string; label: string; score: string }> = {
  club: { name: 'text-white', label: 'text-white/75', score: 'text-white' },
  contrast: { name: 'text-white', label: 'text-white/60', score: 'text-lime' },
  surface: { name: 'text-ink', label: 'text-faint', score: 'text-ink/35' },
  tint: { name: 'text-ink', label: 'text-faint', score: 'text-club' },
  paper: { name: 'text-ink', label: 'text-faint', score: 'text-ink' },
}

/**
 * Jedna polovina. Pod `md` řádek znak | jméno | skóre (polovinou je
 * horní / dolní pruh), od `md` sloupec: znak a jméno u vnějšího okraje,
 * skóre u švu.
 */
function Half({
  side,
  name,
  logo,
  score,
  fill,
  won,
  point,
}: {
  side: 'home' | 'away'
  name: string
  logo: MatchDetail['homeLogo']
  score: number | null
  fill: Fill
  won: boolean
  point: boolean
}) {
  const home = side === 'home'
  const text = TEXT[fill]
  const dark = fill === 'club' || fill === 'contrast'
  const scoreText = won ? text.score : fill === 'surface' ? 'text-ink/35' : text.score

  return (
    <div
      className={cn(
        'grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4.5 min-[25rem]:gap-x-4',
        home ? 'pt-6 pb-9' : 'pt-9 pb-6',
        'md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-6 md:py-9',
        home ? 'md:pr-14 md:pl-8 lg:pr-24 lg:pl-12' : 'md:pr-8 md:pl-14 lg:pr-12 lg:pl-24',
        !home && 'md:grid-cols-[auto_minmax(0,1fr)]',
        'lg:py-12',
      )}
    >
      <TeamCrest
        className={cn(
          'size-12 text-lg min-[25rem]:size-14 md:size-20 md:p-1.5 md:text-3xl lg:size-24 lg:p-2',
          'md:col-start-1 md:row-start-1 md:mb-4 md:self-start',
          !home && 'md:col-start-2 md:justify-self-end',
        )}
        logo={logo}
        name={name}
        sizes="(max-width: 767px) 56px, 96px"
        tone={dark ? (fill === 'club' ? 'club' : 'dark') : 'light'}
      />
      <div
        className={cn(
          'min-w-0 md:col-start-1 md:row-start-2',
          !home && 'md:col-start-2 md:text-right',
        )}
      >
        <Eyebrow as="div" className={text.label}>
          {home ? 'Domácí' : 'Hosté'}
          {won && ' · vítěz'}
        </Eyebrow>
        <div
          className={cn(
            'mt-1 text-sm leading-tight font-extrabold tracking-[-0.02em] text-balance break-words min-[25rem]:text-lg md:text-xl lg:text-3xl',
            text.name,
          )}
        >
          {name}
        </div>
        {point && (
          <Badge className="mt-2" size="xs" variant="split">
            Bod za prodloužení
          </Badge>
        )}
      </div>
      {score !== null && (
        <div
          className={cn(
            'text-[clamp(2.75rem,13vw,4rem)] leading-[0.8] font-extrabold tracking-[-0.05em] tabular-nums md:row-span-2 md:row-start-1 md:self-end md:text-[clamp(4.5rem,9vw,8.5rem)]',
            home ? 'md:col-start-2' : 'md:col-start-1',
            scoreText,
          )}
        >
          {score}
        </div>
      )}
    </div>
  )
}

/**
 * Pečeť na švu: „sn" / „pp" u prodlouženého zápasu, „vs" před zápasem.
 * V normální hrací době je to jen puk (lime tečka) — dvojtečka mezi
 * dvěma obřími čísly by byla zbytečná.
 */
function Seal({ label }: { label: string | null }) {
  return (
    <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-contrast font-mono text-xs font-semibold text-lime uppercase ring-4 ring-surface md:size-14 md:text-sm">
      {label ?? <span className="size-2 rounded-full bg-lime shadow-ring-lime" />}
    </span>
  )
}

function Footer({ match, played }: { match: MatchDetail; played: boolean }) {
  const outcome = played && match.outcome ? OUTCOME_BADGE[match.outcome] : null
  const note = outcomeNote(match.outcome, match.suffix)
  const columns = played ? periodColumns(match) : []
  const day = weekday(match.kickoffISO)

  return (
    <div className="flex flex-col gap-4 px-4.5 py-5 md:px-8 md:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
      <div className="min-w-0">
        <Eyebrow as="div" tone="club">
          {competitionLabel(match)}
        </Eyebrow>
        <MatchMeta
          className="mt-1.5 text-sm font-semibold text-ink md:text-base"
          items={[
            day
              ? `${day.charAt(0).toUpperCase()}${day.slice(1)} ${match.dateLabel}`
              : match.dateLabel,
            match.timeLabel,
            match.venue,
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {columns.map((column) => (
          <Badge className="tabular-nums" key={column.label} size="sm" variant="outline">
            <span className="mr-1.5 text-faint">{column.label}</span>
            {column.home}:{column.away}
          </Badge>
        ))}
        {outcome && (
          <Badge size="sm" title={note ?? undefined} variant={outcome.variant}>
            {outcome.label}
          </Badge>
        )}
        {match.status === 'scheduled' && (
          <>
            <Badge size="sm" variant={match.weAreHome ? 'club' : 'chip'}>
              {match.weAreHome ? 'Doma' : 'Venku'}
            </Badge>
            <VariantCountdown
              className="ml-1 text-ink"
              look="inline"
              targetISO={match.kickoffISO}
            />
          </>
        )}
        {match.status === 'canceled' && (
          <Badge size="sm" variant="loss">
            Zrušeno
          </Badge>
        )}
      </div>
    </div>
  )
}
