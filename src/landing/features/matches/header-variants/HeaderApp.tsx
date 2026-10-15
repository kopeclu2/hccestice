import React from 'react'

import { TeamCrest } from '@/landing/features/matches/components/TeamCrest'
import { competitionLabel } from '@/landing/features/matches/view/matchFormat'
import { Eyebrow } from '@/landing/ui/Kicker'
import { cn } from '@/lib/utils'

import {
  hasScore,
  type HeaderVariantProps,
  MetaItem,
  OutcomeBadge,
  periodColumns,
  SideBadge,
  SrTitle,
  StatusBadge,
  type VariantMatch,
  weekdayLabel,
  winnerSide,
} from './shared'
import { VariantCountdown } from './VariantCountdown'

/**
 * Varianta D — „Kompaktní aplikace". Hustá tabule jako v Livesportu:
 * dva řádky znak | tým | třetiny | celkem, vítězný řádek tučně, poražený
 * ztišený. Údaje (datum, místo, výsledek) jsou v postranním sloupci
 * (pod `lg` pod tabulkou). Celá hlavička je nízká — obsah stránky
 * (časová osa) začíná o půl obrazovky výš než u ostatních variant.
 *
 * Pod 360 px se sloupce třetin nevejdou vedle dvouřádkového jména,
 * takže se schovají a třetiny se vypíšou jedním řádkem pod tabulkou.
 */
export function HeaderApp({ match, titleAs = 'h1' }: HeaderVariantProps) {
  const played = match.status === 'played' && hasScore(match)
  const columns = played ? periodColumns(match) : []
  const winner = winnerSide(match)

  const rows = [
    { side: 'home' as const, name: match.homeName, logo: match.homeLogo, total: match.homeScore },
    { side: 'away' as const, name: match.awayName, logo: match.awayLogo, total: match.awayScore },
  ]

  return (
    <div className="overflow-hidden rounded-tile border border-line-mid bg-surface text-ink">
      <SrTitle as={titleAs} match={match} />

      <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 px-4 py-4 md:px-6 md:py-5 lg:px-7 lg:py-6">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Eyebrow as="div" className="min-w-0" tight>
              {competitionLabel(match)}
            </Eyebrow>
            <Status match={match} />
          </div>

          <table className="mt-3 w-full border-collapse tabular-nums md:mt-4">
            <caption className="sr-only">{played ? 'Skóre po třetinách' : 'Týmy zápasu'}</caption>
            <thead>
              <tr className="text-eyebrow font-semibold tracking-caps-sm text-faint uppercase">
                <th className="pb-1.5 text-left font-semibold" scope="col">
                  <span className="sr-only">Tým</span>
                </th>
                {columns.map((column) => (
                  <th
                    className={cn(
                      'w-6 pb-1.5 text-center font-semibold max-3xs:hidden md:w-9',
                      (column.label === 'SN' || column.label === 'P') && 'text-club',
                    )}
                    key={column.label}
                    scope="col"
                  >
                    <abbr className="no-underline" title={column.title}>
                      {column.label}
                    </abbr>
                  </th>
                ))}
                <th className="w-10 pb-1.5 text-right font-semibold md:w-14" scope="col">
                  {played ? (
                    <abbr className="no-underline" title="Celkem">
                      Σ
                    </abbr>
                  ) : (
                    <span className="sr-only">Skóre</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const won = winner === row.side
                const lost = played && !won && winner !== 'draw'
                return (
                  <tr className="border-t border-line-soft" key={row.side}>
                    <th className="py-2 pr-2 text-left md:py-2.5" scope="row">
                      <span className="flex items-center gap-2.5 md:gap-3">
                        <TeamCrest
                          className="size-7 text-xs md:size-9 md:text-sm"
                          logo={row.logo}
                          name={row.name}
                          sizes="36px"
                          tone="light"
                        />
                        <span
                          className={cn(
                            'min-w-0 text-sm leading-tight text-balance break-words md:text-lg',
                            lost ? 'font-medium text-ink-soft' : 'font-bold',
                          )}
                        >
                          {row.name}
                          <span
                            aria-hidden
                            className="ml-1.5 text-eyebrow font-semibold tracking-caps-sm whitespace-nowrap text-faint uppercase"
                          >
                            {row.side === 'home' ? 'D' : 'H'}
                          </span>
                          <span className="sr-only">
                            {row.side === 'home' ? ' (domácí)' : ' (hosté)'}
                          </span>
                        </span>
                      </span>
                    </th>
                    {columns.map((column) => (
                      <td
                        className="py-2 text-center text-sm font-medium text-faint max-3xs:hidden md:py-2.5 md:text-base"
                        key={column.label}
                      >
                        {column[row.side]}
                      </td>
                    ))}
                    <td
                      className={cn(
                        'py-2 text-right text-2xl leading-none font-extrabold md:py-2.5 md:text-3xl',
                        lost && 'text-faint',
                        !played && 'text-inactive',
                      )}
                    >
                      {played ? row.total : '–'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {columns.length > 0 && (
            <p aria-hidden className="mt-2 text-xs font-medium text-faint 3xs:hidden">
              {columns
                .map(
                  (column) =>
                    `${column.label === 'P' || column.label === 'SN' ? `${column.label} ` : ''}${column.home}:${column.away}`,
                )
                .join(' · ')}
            </p>
          )}
        </div>

        <Facts match={match} played={played} />
      </div>
    </div>
  )
}

/** Stavová pilulka vpravo nahoře — „Konec po nájezdech" / odpočet. */
function Status({ match }: { match: VariantMatch }) {
  if (match.status === 'scheduled') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1 text-club">
        <span aria-hidden className="size-1.5 rounded-full bg-lime shadow-ring-lime" />
        <VariantCountdown className="text-xs" look="inline" targetISO={match.kickoffISO} />
      </span>
    )
  }
  return <StatusBadge look="light" match={match} />
}

function Facts({ match, played }: { match: VariantMatch; played: boolean }) {
  const day = weekdayLabel(match.kickoffISO)

  return (
    <dl className="grid grid-cols-2 content-center gap-x-5 gap-y-3 border-t border-line-soft bg-tint-hover px-4 py-4 md:grid-cols-4 md:px-6 lg:grid-cols-2 lg:border-t-0 lg:border-l lg:px-7 lg:py-6">
      <MetaItem label="Datum" look="compact">
        {match.dateLabel}
        {day && <span className="block text-xs font-medium text-faint">{day}</span>}
      </MetaItem>
      <MetaItem label="Buly" look="compact">
        {match.timeLabel}
      </MetaItem>
      <MetaItem label="Místo" look="compact">
        {match.venue ?? '—'}
      </MetaItem>
      {played && match.outcome ? (
        <MetaItem label="Výsledek" look="compact">
          <OutcomeBadge
            noteClassName="mt-1 block text-xs font-medium text-faint"
            outcome={match.outcome}
            size="xs"
            suffix={match.suffix}
          />
        </MetaItem>
      ) : (
        <MetaItem label="Strana" look="compact">
          <SideBadge look="light" size="xs" weAreHome={match.weAreHome} />
        </MetaItem>
      )}
    </dl>
  )
}
