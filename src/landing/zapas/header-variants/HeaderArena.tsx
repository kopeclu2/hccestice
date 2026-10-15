import React from 'react'

import { cn } from '@/lib/utils'

import { Badge } from '../../components/Badge'
import { DotEyebrow } from '../../components/DotEyebrow'
import { Eyebrow } from '../../components/Kicker'
import { OUTCOME_BADGE } from '../../components/outcome'
import { PatternBackground } from '../../components/PatternBackground'
import type { MatchDetail } from '../../types'

import {
  competitionLabel,
  Crest,
  hasScore,
  type HeaderVariantProps,
  outcomeNote,
  periodColumns,
  SrTitle,
  SUFFIX_NOTE,
  teamCode,
  weekday,
  winnerSide,
} from './shared'
import { VariantCountdown } from './VariantCountdown'

/**
 * Varianta A — „Aréna". Tmavá světelná tabule jako v televizním přenosu:
 * skóre v „LED" polích monospace písmem, třetiny jako mini tabulka
 * 1 | 2 | 3 | P | SN s třípísmennými zkratkami týmů, znaky velké a vítěz
 * podsvícený lime. Nahoře lišta se soutěží a stavem, dole pás údajů.
 */
export function HeaderArena({ match, titleAs = 'h1' }: HeaderVariantProps) {
  const winner = winnerSide(match)
  const scheduled = match.status !== 'played' || !hasScore(match)

  return (
    <div className="relative isolate overflow-hidden rounded-section bg-contrast text-on-contrast">
      <PatternBackground className="opacity-70" fade="center" tone="lime" variant="circuit" />
      <PatternBackground tone="lime" variant="glow" />
      <SrTitle as={titleAs} match={match} />

      {/* Horní lišta: soutěž vlevo, stav vpravo — jako horní řádek TV grafiky. */}
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-white/10 px-4.5 py-3.5 md:px-8 lg:px-12 lg:py-4">
        <DotEyebrow className="min-w-0">{competitionLabel(match)}</DotEyebrow>
        <StatusChip match={match} />
      </div>

      <div className="relative px-4.5 pt-6 pb-7 md:px-8 md:pt-9 md:pb-10 lg:px-12 lg:pt-12 lg:pb-12">
        <Board match={match} scheduled={scheduled} winner={winner} />

        {scheduled ? (
          match.status === 'scheduled' && (
            <div className="mx-auto mt-8 max-w-120 md:mt-10">
              <Eyebrow as="div" className="mb-2.5 text-center" tone="white">
                Do úvodního buly
              </Eyebrow>
              <VariantCountdown look="tiles" targetISO={match.kickoffISO} />
            </div>
          )
        ) : (
          <PeriodTable match={match} winner={winner} />
        )}
      </div>

      <Facts match={match} scheduled={scheduled} />
    </div>
  )
}

function StatusChip({ match }: { match: MatchDetail }) {
  if (match.status === 'canceled') {
    return (
      <Badge size="xs" variant="loss">
        Zrušeno
      </Badge>
    )
  }
  if (match.status === 'scheduled') {
    return (
      <Badge caps size="xs" variant={match.weAreHome ? 'lime' : 'glassOutline'}>
        {match.weAreHome ? 'Doma' : 'Venku'}
      </Badge>
    )
  }
  return (
    <Badge caps className="gap-2 text-white/80" size="xs" variant="glassOutline">
      <span aria-hidden className="size-1.5 rounded-full bg-white/60" />
      Konec{match.suffix ? ` · ${SUFFIX_NOTE[match.suffix]}` : ''}
    </Badge>
  )
}

/**
 * Tabule: znak | skóre | skóre | znak. Čtyři sloupce místo tří, aby pod
 * `md` mohla jména zabrat každé polovinu šířky (domácí sloupce 1–2, hosté
 * 3–4) — v úzkém sloupci pod znakem se „Divočáci" lámali uprostřed slova.
 * Od `md` jméno stojí pod znakem a je zarovnané ke skóre.
 */
function Board({
  match,
  scheduled,
  winner,
}: {
  match: MatchDetail
  scheduled: boolean
  winner: ReturnType<typeof winnerSide>
}) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-3 md:gap-x-3 md:gap-y-4"
    >
      <TeamCrest
        className="col-start-1 justify-self-start md:mr-[clamp(0.5rem,3vw,3rem)] md:justify-self-end"
        lit={winner === 'home'}
        logo={match.homeLogo}
        name={match.homeName}
      />

      {scheduled ? (
        <div className="col-span-2 col-start-2 row-start-1 flex flex-col items-center">
          <LedBox className="px-3 md:px-5">{match.timeLabel}</LedBox>
        </div>
      ) : (
        <>
          <LedBox className="col-start-2 row-start-1" lit={winner === 'home'}>
            {match.homeScore}
          </LedBox>
          <LedBox className="col-start-3 row-start-1" lit={winner === 'away'}>
            {match.awayScore}
          </LedBox>
          {match.suffix && (
            <span className="z-1 col-span-2 col-start-2 row-start-1 translate-y-1/2 self-end justify-self-center rounded-full bg-lime px-2 py-0.5 font-mono text-eyebrow font-semibold tracking-[0.12em] text-ink uppercase md:px-2.5 md:text-xs">
              {match.suffix}
            </span>
          )}
        </>
      )}

      <TeamCrest
        className="col-start-4 row-start-1 justify-self-end md:ml-[clamp(0.5rem,3vw,3rem)] md:justify-self-start"
        lit={winner === 'away'}
        logo={match.awayLogo}
        name={match.awayName}
      />

      <TeamName
        className="col-span-2 col-start-1 text-left md:col-span-1 md:text-right"
        name={match.homeName}
        side="Domácí"
      />
      <TeamName
        className="col-span-2 col-start-3 text-right md:col-span-1 md:col-start-4 md:text-left"
        name={match.awayName}
        side="Hosté"
      />
    </div>
  )
}

function TeamCrest({
  className,
  lit,
  logo,
  name,
}: {
  className?: string
  lit: boolean
  logo: MatchDetail['homeLogo']
  name: string
}) {
  return (
    <div className={cn('row-start-1 rounded-full', className)}>
      <Crest
        className={cn(
          'size-13 text-lg min-[25rem]:size-16 md:size-22 md:p-1.5 md:text-3xl lg:size-28 lg:p-2 lg:text-4xl',
          lit && 'ring-2 ring-lime ring-offset-3 ring-offset-contrast md:ring-offset-4',
        )}
        logo={logo}
        name={name}
        sizes="(max-width: 767px) 64px, 112px"
      />
    </div>
  )
}

function TeamName({ className, name, side }: { className?: string; name: string; side: string }) {
  return (
    <div className={cn('row-start-2 min-w-0 self-start md:mx-[clamp(0rem,1vw,1rem)]', className)}>
      <div className="text-sm leading-tight font-extrabold tracking-[0.02em] text-balance break-words uppercase md:text-lg lg:text-xl">
        {name}
      </div>
      <div className="mt-1 text-eyebrow font-semibold tracking-[0.16em] text-white/45 uppercase">
        {side}
      </div>
    </div>
  )
}

/** „LED" pole se skóre — monospace, aby 1 a 8 měly stejnou šířku. */
function LedBox({
  children,
  className,
  lit = false,
}: {
  children: React.ReactNode
  className?: string
  lit?: boolean
}) {
  return (
    <div
      className={cn(
        'relative min-w-[1.35em] rounded-field border border-white/12 bg-pine-deep/80 px-2 py-1.5 text-center font-mono text-[clamp(2.5rem,11vw,6.5rem)] leading-none font-bold tabular-nums shadow-overlay md:px-4 md:py-3',
        lit
          ? 'text-lime [text-shadow:0_0_0.35em_color-mix(in_oklab,var(--color-lime)_55%,transparent)]'
          : 'text-white/90',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Mini tabulka po třetinách. Je to skutečná `<table>` (čtečky ji projdou
 * po řádcích); zkratky týmů jsou pro oko, celé jméno nese `sr-only`.
 */
function PeriodTable({
  match,
  winner,
}: {
  match: MatchDetail
  winner: ReturnType<typeof winnerSide>
}) {
  const columns = periodColumns(match)
  if (columns.length === 0) return null

  const rows = [
    { side: 'home' as const, name: match.homeName, total: match.homeScore },
    { side: 'away' as const, name: match.awayName, total: match.awayScore },
  ]

  return (
    <div className="mx-auto mt-9 max-w-120 md:mt-12">
      <table className="w-full table-fixed border-collapse font-mono text-sm tabular-nums md:text-base">
        <caption className="sr-only">Skóre po třetinách</caption>
        <thead>
          <tr className="text-eyebrow tracking-[0.12em] text-white/45 uppercase">
            <th className="w-[26%] pb-2 text-left font-semibold" scope="col">
              <span className="sr-only">Tým</span>
            </th>
            {columns.map((column) => (
              <th className="pb-2 font-semibold" key={column.label} scope="col">
                <abbr className="no-underline" title={column.title}>
                  {column.label}
                </abbr>
              </th>
            ))}
            <th className="pb-2 font-semibold text-lime" scope="col">
              <abbr className="no-underline" title="Celkem">
                Σ
              </abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-white/10" key={row.side}>
              <th className="py-2.5 text-left font-semibold text-white md:py-3" scope="row">
                <span aria-hidden>{teamCode(row.name)}</span>
                <span className="sr-only">{row.name}</span>
              </th>
              {columns.map((column) => (
                <td className="py-2.5 text-center text-white/70 md:py-3" key={column.label}>
                  {column[row.side]}
                </td>
              ))}
              <td
                className={cn(
                  'py-2.5 text-center font-semibold md:py-3',
                  winner === row.side ? 'text-lime' : 'text-white',
                )}
              >
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Facts({ match, scheduled }: { match: MatchDetail; scheduled: boolean }) {
  const outcome = match.outcome ? OUTCOME_BADGE[match.outcome] : null
  const note = outcomeNote(match.outcome, match.suffix)
  const day = weekday(match.kickoffISO)

  return (
    <dl className="relative grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 bg-white/4 px-4.5 py-5 md:grid-cols-[repeat(auto-fit,minmax(min(11rem,100%),1fr))] md:gap-x-8 md:px-8 lg:px-12 lg:py-6">
      <Fact className="col-span-2 md:col-span-1" label="Datum">
        {day && <span className="text-white/60 capitalize">{day} · </span>}
        <span className="inline-block">
          {match.dateLabel} · {match.timeLabel}
        </span>
      </Fact>
      {match.venue && <Fact label="Místo">{match.venue}</Fact>}
      {scheduled ? (
        <Fact label="Strana">{match.weAreHome ? 'Doma' : 'Venku'}</Fact>
      ) : (
        outcome && (
          <Fact label="Výsledek">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Badge size="sm" variant={outcome.variant}>
                {outcome.label}
              </Badge>
              {note && <span className="text-sm font-medium text-white/60">{note}</span>}
            </span>
          </Fact>
        )
      )}
    </dl>
  )
}

function Fact({
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
        <Eyebrow tone="white">{label}</Eyebrow>
      </dt>
      <dd className="mt-1 text-sm font-semibold [overflow-wrap:anywhere] text-white md:text-base">
        {children}
      </dd>
    </div>
  )
}
