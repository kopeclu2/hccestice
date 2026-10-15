import React from 'react'

import type { MatchDetail } from '@/landing/features/matches/types'
import { SUFFIX_NOTE } from '@/landing/features/matches/view/matchFormat'

/**
 * Sdílená logika variant hlavičky detailu zápasu. Kterou variantu detail
 * vykreslí, volí správce v Nastavení webu (`matchHeaderVariant`, přepínač
 * `MatchHeaderByVariant` v `index.tsx`); katalog všech je na
 * `/vzory/hlavicka-zapasu`. Původní `MatchHeader` / `MatchScoreboard`
 * (`classic`) se s variantami záměrně nesdílí.
 */

export type HeaderVariantProps = {
  match: MatchDetail
  /**
   * Úroveň neviditelného titulku. Na detailu zápasu je hlavička celou
   * hlavičkou stránky (`h1`); v katalogu variant je `h1` nadpis katalogu.
   */
  titleAs?: 'h1' | 'h2' | 'h3'
}

export const hasScore = (
  match: MatchDetail,
): match is MatchDetail & { homeScore: number; awayScore: number } =>
  match.homeScore != null && match.awayScore != null

/** Kdo vyhrál (domácí / hosté / nikdo); null = bez skóre. */
export const winnerSide = (match: MatchDetail): 'home' | 'away' | 'draw' | null => {
  if (!hasScore(match)) return null
  if (match.homeScore === match.awayScore) return 'draw'
  return match.homeScore > match.awayScore ? 'home' : 'away'
}

export const ourSide = (match: MatchDetail): 'home' | 'away' => (match.weAreHome ? 'home' : 'away')

/**
 * Věta pro čtečky — „HC Polička B 8, HC Čestice 7, po nájezdech".
 * Vizuální tabule je ve variantách `aria-hidden`, informaci nese tahle věta.
 */
export const scoreSentence = (match: MatchDetail): string => {
  if (!hasScore(match)) return match.title
  const note = match.suffix ? `, ${SUFFIX_NOTE[match.suffix]}` : ''
  return `${match.homeName} ${match.homeScore}, ${match.awayName} ${match.awayScore}${note}`
}

/** Den v týdnu („sobota") — data v CMS ho nenesou, odvozuje se z ISO v Europe/Prague. */
export const weekday = (iso: string): string | null => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('cs-CZ', { weekday: 'long', timeZone: 'Europe/Prague' }).format(
    date,
  )
}

/** Den a měsíc číslem („13", „12") pro velké číslicové kompozice. */
export const dayMonth = (iso: string): { day: string; month: string } | null => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    timeZone: 'Europe/Prague',
  }).formatToParts(date)
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return day && month ? { day, month } : null
}

export type PeriodColumn = {
  /** Krátký popisek sloupce: „1", „2", „3", „P", „SN". */
  label: string
  /** Dlouhý popisek pro čtečky. */
  title: string
  home: number | null
  away: number | null
}

/**
 * Skóre po úsecích jako sloupce tabule: 1 | 2 | 3 | P | SN.
 *
 * Synchronizace ukládá jen tři třetiny. Prodloužení a nájezdy se proto
 * dopočítávají: u `sn` skončilo prodloužení 0:0 a nájezdy dávají vítězi
 * jednu branku (tak ji zapisuje AHL — 60:00 a započítá se do skóre),
 * u `pp` dá vítěz jednu branku v prodloužení. Když součet úseků se
 * skóre nesedí (ručně zadaný zápas), vrátí se jen třetiny — radši méně
 * sloupců než tabule, která si odporuje.
 */
export const periodColumns = (match: MatchDetail): PeriodColumn[] => {
  if (match.thirds.length === 0) return []

  const columns: PeriodColumn[] = match.thirds.map(({ home, away }, index) => ({
    label: String(index + 1),
    title: `${index + 1}. třetina`,
    home,
    away,
  }))
  if (!match.suffix || !hasScore(match)) return columns

  const homeWins = match.homeScore > match.awayScore
  const ot = match.timeline.find((period) => /prodl/i.test(period.label))
  const otPair =
    ot?.score ??
    (match.suffix === 'sn'
      ? { home: 0, away: 0 }
      : homeWins
        ? { home: 1, away: 0 }
        : { home: 0, away: 1 })
  const extra: PeriodColumn[] = [
    { label: 'P', title: 'Prodloužení', home: otPair.home, away: otPair.away },
  ]
  if (match.suffix === 'sn') {
    extra.push({
      label: 'SN',
      title: 'Samostatné nájezdy',
      home: homeWins ? 1 : 0,
      away: homeWins ? 0 : 1,
    })
  }

  const all = [...columns, ...extra]
  const sum = (side: 'home' | 'away') =>
    all.reduce((total, column) => total + (column[side] ?? 0), 0)
  return sum('home') === match.homeScore && sum('away') === match.awayScore ? all : columns
}

/** Neviditelný titulek varianty — nese skóre celou větou. */
export function SrTitle({
  as: Tag = 'h1',
  match,
}: {
  as?: 'h1' | 'h2' | 'h3'
  match: MatchDetail
}) {
  return <Tag className="sr-only">{scoreSentence(match)}</Tag>
}
