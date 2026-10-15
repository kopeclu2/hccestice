import React from 'react'

import { OUTCOME_BADGE } from '@/landing/features/matches/components/outcome'
import { TeamPair } from '@/landing/features/matches/components/TeamPair'
import type { MatchDetail } from '@/landing/features/matches/types'
import { competitionLabel, SUFFIX_NOTE } from '@/landing/features/matches/view/matchFormat'
import { Badge } from '@/landing/ui/Badge'
import { Eyebrow } from '@/landing/ui/Kicker'
import { PatternBackground } from '@/landing/ui/PatternBackground'
import { cn } from '@/lib/utils'

import {
  Crest,
  dayMonth,
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
 * Varianta B — „Editorial". Světlý papírový panel jako titulní strana
 * sportovní přílohy: tiráž s dvojitou linkou (soutěž, den, sezóna),
 * obří obrysové číslice skóre ve stylu `ErrorCode` — vítězné číslo je
 * vyplněné klubovou zelenou —, jména týmů jako titulek a pod nimi
 * „perex" jednou větou. Údaje jsou v jemném řádku pod linkou.
 */
export function HeaderEditorial({ match, titleAs = 'h1' }: HeaderVariantProps) {
  const played = match.status === 'played' && hasScore(match)

  return (
    <div className="relative isolate overflow-hidden rounded-section border border-line-mid bg-surface text-ink shadow-tile">
      <PatternBackground variant="noise" />
      <SrTitle as={titleAs} match={match} />

      <div className="relative px-4.5 pt-5 pb-6 md:px-9 md:pt-8 md:pb-9 lg:px-14 lg:pt-10 lg:pb-12">
        <Masthead match={match} />

        {played ? <PlayedSpread match={match} /> : <UpcomingSpread match={match} />}

        <p className="mx-auto mt-6 max-w-160 text-center text-sm leading-relaxed text-pretty text-dim md:mt-8 md:text-lg">
          {standfirst(match)}
        </p>

        <Dateline match={match} played={played} />
      </div>
    </div>
  )
}

/** Tiráž: silná linka, pod ní vlasová — jako hlavička novinové strany. */
function Masthead({ match }: { match: MatchDetail }) {
  const day = weekday(match.kickoffISO)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-2">
        <Eyebrow tone="club">{competitionLabel(match)}</Eyebrow>
        <span className="text-xs font-medium">
          {day && <span className="capitalize">{day} </span>}
          {match.dateLabel}
        </span>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 border-b border-line py-1.5 text-xs font-medium text-faint">
        <span>{match.seasonLabel ? `Sezóna ${match.seasonLabel}` : 'HC Čestice'}</span>
        <span>
          {match.status === 'played'
            ? 'Výsledek zápasu'
            : match.status === 'canceled'
              ? 'Zrušený zápas'
              : 'Pozvánka na zápas'}
        </span>
      </div>
    </div>
  )
}

/**
 * Odehraný zápas: obří obrysové skóre nahoře (pod `lg` přes celou šířku),
 * jména týmů po stranách. Od `lg` trojice jméno | skóre | jméno, zarovnaná
 * na účaří číslic.
 */
function PlayedSpread({ match }: { match: MatchDetail }) {
  const winner = winnerSide(match)
  return (
    <div
      aria-hidden
      className="mt-6 grid grid-cols-2 items-end gap-x-4 gap-y-5 md:mt-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10"
    >
      <div className="relative col-span-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1">
        <div className="flex items-start text-[clamp(6.5rem,30vw,14rem)] leading-[0.82] font-extrabold tracking-[-0.06em] tabular-nums select-none">
          <Digit filled={winner === 'home'}>{match.homeScore}</Digit>
          <span className="mx-[0.12em] h-[0.07em] w-[0.24em] flex-none self-center bg-club" />
          <Digit filled={winner === 'away'}>{match.awayScore}</Digit>
        </div>
        {match.suffix && (
          <span className="absolute top-1 right-0 translate-x-[calc(100%+0.75rem)] text-xs font-semibold text-club [writing-mode:vertical-rl] max-sm:static max-sm:mt-2 max-sm:block max-sm:translate-x-0 max-sm:text-center max-sm:[writing-mode:horizontal-tb]">
            {SUFFIX_NOTE[match.suffix]}
          </span>
        )}
      </div>

      <TeamBlock
        align="start"
        className="lg:col-start-1 lg:row-start-1 lg:items-end lg:text-right"
        logo={match.homeLogo}
        name={match.homeName}
        side="Domácí"
        won={winner === 'home'}
      />
      <TeamBlock
        align="end"
        className="lg:col-start-3 lg:row-start-1 lg:items-start lg:text-left"
        logo={match.awayLogo}
        name={match.awayName}
        side="Hosté"
        won={winner === 'away'}
      />
    </div>
  )
}

function Digit({ children, filled }: { children: React.ReactNode; filled: boolean }) {
  return <span className={cn(filled ? 'text-club' : 'text-ink/30 text-stroke')}>{children}</span>
}

function TeamBlock({
  name,
  side,
  logo,
  won,
  align,
  className,
}: {
  name: string
  side: string
  logo: MatchDetail['homeLogo']
  won: boolean
  align: 'start' | 'end'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col pb-[0.4rem] lg:pb-[1.1rem]',
        align === 'start' ? 'items-start text-left' : 'items-end text-right',
        className,
      )}
    >
      <span
        className={cn('flex items-center gap-2', align === 'end' && 'flex-row-reverse lg:flex-row')}
      >
        <Crest
          className="size-8 text-xs md:size-10 md:text-sm"
          logo={logo}
          name={name}
          sizes="40px"
          tone="light"
        />
        <Eyebrow tone={won ? 'club' : 'faint'}>{won ? `${side} · vítěz` : side}</Eyebrow>
      </span>
      <span
        className={cn(
          'mt-2 text-lg leading-[1.05] font-extrabold tracking-[-0.03em] text-balance break-words min-[25rem]:text-xl md:text-4xl lg:text-4xl',
          !won && 'text-ink-soft',
        )}
      >
        {name}
      </span>
    </div>
  )
}

/**
 * Naplánovaný (a zrušený) zápas: místo skóre obří obrysové datum, jméno
 * soupeře jako titulek „HC Čestice × …" a pod tím odpočet.
 */
function UpcomingSpread({ match }: { match: MatchDetail }) {
  const date = dayMonth(match.kickoffISO)
  return (
    <div className="mt-6 flex flex-col items-center md:mt-8 lg:mt-10">
      {date && (
        <div
          aria-hidden
          className="flex items-baseline text-[clamp(5.5rem,24vw,11.5rem)] leading-[0.82] font-extrabold tracking-[-0.06em] tabular-nums select-none"
        >
          <span className="text-ink/30 text-stroke">{date.day}</span>
          <span className="text-club">.</span>
          <span className="text-ink/30 text-stroke">{date.month}</span>
          <span className="text-club">.</span>
        </div>
      )}
      <div aria-hidden className="mt-4 flex items-center gap-2.5 md:mt-6">
        <Crest
          className="size-9 text-sm md:size-11"
          logo={match.homeLogo}
          name={match.homeName}
          sizes="44px"
          tone="light"
        />
        <span className="text-sm font-semibold text-faint">×</span>
        <Crest
          className="size-9 text-sm md:size-11"
          logo={match.awayLogo}
          name={match.awayName}
          sizes="44px"
          tone="light"
        />
      </div>
      <p
        aria-hidden
        className="mt-3 max-w-200 text-center text-xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance md:text-4xl lg:text-4xl"
      >
        {/* Zlom jen za „×", ne uvnitř jména týmu (viz `TeamPair`). */}
        <TeamPair away={match.awayName} home={match.homeName} />
      </p>
      {match.status === 'scheduled' && (
        <div className="mt-6 w-full max-w-110 md:mt-8">
          <Eyebrow as="div" className="mb-2 text-center">
            Do úvodního buly · {match.timeLabel}
          </Eyebrow>
          <VariantCountdown look="plain" targetISO={match.kickoffISO} />
        </div>
      )}
      {match.status === 'canceled' && (
        <Badge className="mt-5" size="sm" variant="loss">
          Zrušeno
        </Badge>
      )}
    </div>
  )
}

/**
 * Perex jednou větou z pohledu Čestic. Jméno soupeře se neskloňuje
 * („týmu HC Polička B"), ať věta sedí na libovolný název z AHL.
 */
const standfirst = (match: MatchDetail): string => {
  const opponent = match.weAreHome ? match.awayName : match.homeName
  const place = match.weAreHome ? 'Doma' : 'Venku'

  if (match.status === 'canceled') return `Zápas HC Čestice s týmem ${opponent} se nehraje.`
  if (match.status === 'scheduled' || !hasScore(match)) {
    return match.weAreHome
      ? `HC Čestice přivítá na domácím ledě tým ${opponent}.`
      : `HC Čestice zajíždí na led týmu ${opponent}.`
  }

  const ours = ourSide(match) === 'home' ? match.homeScore : match.awayScore
  const theirs = ourSide(match) === 'home' ? match.awayScore : match.homeScore
  const score = `${ours}:${theirs}${match.suffix ? ` ${SUFFIX_NOTE[match.suffix]}` : ''}`

  switch (match.outcome) {
    case 'win':
      return `${place} HC Čestice porazil tým ${opponent} ${score}.`
    case 'draw':
      return `${place} HC Čestice remizoval s týmem ${opponent} ${score}.`
    case 'otLoss':
      return `${place} HC Čestice podlehl týmu ${opponent} ${score} — bod do tabulky ale zůstává.`
    default:
      return `${place} HC Čestice podlehl týmu ${opponent} ${score}.`
  }
}

/** Jemný řádek údajů pod linkou: kdy, kde, třetiny a výsledek. */
function Dateline({ match, played }: { match: MatchDetail; played: boolean }) {
  const outcome = played && match.outcome ? OUTCOME_BADGE[match.outcome] : null
  const columns = played ? periodColumns(match) : []

  return (
    <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 md:mt-9 md:grid-cols-[repeat(auto-fit,minmax(min(8.5rem,100%),1fr))] lg:mt-10">
      <Item label="Buly">{match.timeLabel}</Item>
      {match.venue && <Item label="Místo">{match.venue}</Item>}
      {columns.length > 0 && (
        <Item className="max-md:col-span-2 max-md:row-start-2" label="Po třetinách">
          <span className="flex flex-wrap gap-x-2.5 gap-y-0.5 tabular-nums">
            {columns.map((column) => (
              <span className="whitespace-nowrap" key={column.label}>
                {column.label.length > 1 || column.label === 'P' ? (
                  <abbr className="mr-1 text-xs text-faint no-underline" title={column.title}>
                    {column.label}
                  </abbr>
                ) : null}
                {column.home}:{column.away}
              </span>
            ))}
          </span>
        </Item>
      )}
      {outcome ? (
        <Item label="Výsledek">
          <Badge size="sm" variant={outcome.variant}>
            {outcome.label}
          </Badge>
        </Item>
      ) : (
        match.status === 'scheduled' && (
          <Item label="Strana">{match.weAreHome ? 'Doma' : 'Venku'}</Item>
        )
      )}
    </dl>
  )
}

function Item({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt>
        <Eyebrow>{label}</Eyebrow>
      </dt>
      <dd className="mt-1 text-sm font-semibold [overflow-wrap:anywhere] md:text-base">
        {children}
      </dd>
    </div>
  )
}
