import Link from 'next/link'
import React from 'react'

import { OUTCOME_BADGE } from '@/landing/features/matches/components/outcome'
import { StripCountdown } from '@/landing/features/matches/components/StripCountdown'
import { splitMatchTitle, TeamPair } from '@/landing/features/matches/components/TeamPair'
import type { LastResult, UpcomingMatch } from '@/landing/features/matches/types'
import { Badge } from '@/landing/ui/Badge'
import { Eyebrow } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

/**
 * Kompaktní proužek „Příští zápas + poslední výsledek" hned pod hero.
 *
 * Aktuální informace je tak na dosah z mobilu dřív než dlouhé sekce homepage.
 * Jediný zdroj „příští zápas + poslední výsledek" na home page: odpočet nese
 * `StripCountdown` (malý klientský ostrůvek), sekce Zápasy příští zápas
 * neopakuje. Bez jediného zápasu (nová sezóna bez rozpisu i historie) vrací
 * `null`; s jedním ze dvou zůstane jedna buňka přes celou šířku.
 *
 * Desktop (`lg`): jeden řádek, dvě buňky vedle sebe. Mobil: dvě buňky pod
 * sebou, každá dvouřádková (popisek + titulek, pod nimi údaj).
 */
export function MatchStrip({
  upcoming,
  lastResult,
}: {
  upcoming: UpcomingMatch | null
  lastResult: LastResult | null
}) {
  if (!upcoming && !lastResult) return null

  return (
    <SectionShell spacing="bar">
      <div
        className={cn(
          'grid overflow-hidden rounded-tile border border-line-soft bg-surface',
          upcoming &&
            lastResult &&
            'divide-y divide-line-soft md:grid-cols-2 md:divide-x md:divide-y-0',
        )}
      >
        {upcoming && (
          <StripCell href={upcoming.href} label="Příští zápas" title={upcoming.title}>
            <StripCountdown targetISO={upcoming.kickoffISO} />
            <span className="text-xs font-medium text-faint md:text-sm">{upcoming.subtitle}</span>
          </StripCell>
        )}
        {lastResult && (
          <StripCell href={lastResult.href} label="Poslední výsledek" title={lastResult.title}>
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="text-base font-extrabold tracking-snug text-ink tabular-nums md:text-lg">
                {lastResult.score}
                {lastResult.suffix && ` ${lastResult.suffix}`}
              </span>
              <Badge size="xs" variant={OUTCOME_BADGE[lastResult.outcome].variant}>
                {OUTCOME_BADGE[lastResult.outcome].label}
              </Badge>
              <span className="text-xs font-medium text-faint max-md:hidden md:text-sm">
                {lastResult.side} · {stripDate(lastResult.dateLabel)}
              </span>
            </span>
          </StripCell>
        )}
      </div>
    </SectionShell>
  )
}

/** Datum bez názvu fáze soutěže („1. 11. · Základní část“ → „1. 11.“). */
function stripDate(dateLabel: string) {
  return dateLabel.split(' · ')[0]
}

/** Jedna buňka proužku; odkaz na detail zápasu, bez slugu na výpis `/zapasy`. */
function StripCell({
  href,
  label,
  title,
  children,
}: {
  href: string | null
  label: string
  title: string
  children: React.ReactNode
}) {
  const parts = splitMatchTitle(title)
  return (
    <Link
      className="group flex min-h-14 items-center gap-3 px-4.5 py-3.5 transition-colors hover:bg-chip focus-visible:bg-chip focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-club md:px-6"
      href={href ?? routes.list.matches}
    >
      <span className="flex min-w-0 flex-col gap-1 xl:flex-row xl:flex-wrap xl:items-baseline xl:gap-x-4">
        <span className="text-base leading-snug font-extrabold tracking-snug text-ink md:text-lg">
          {parts ? <TeamPair away={parts.away} home={parts.home} /> : title}
        </span>
        {/* Popisek a údaje: pod titulkem (2. řádek), od `xl` ve stejném řádku
            — popisek před titulkem (`order-first`). */}
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 xl:contents">
          <Eyebrow className="xl:order-first" tone="club-dark">
            {label}
          </Eyebrow>
          {children}
        </span>
      </span>
    </Link>
  )
}
