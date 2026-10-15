import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'

import { formatCompetition } from '../../data/matchFormat'
import type { MatchDetail, Outcome, Photo } from '../../types'

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

export const SUFFIX_NOTE = { pp: 'po prodloužení', sn: 'po nájezdech' } as const

/** „VČHL 2. ročník · Základní část“, ne surový text z AHL. */
export const competitionLabel = (match: MatchDetail): string =>
  formatCompetition(match.competition) ?? 'VČHL'

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

const parsePair = (value: string | null | undefined): [number, number] | null => {
  const match = /^\s*(\d+)\s*:\s*(\d+)\s*$/.exec(value ?? '')
  return match ? [Number(match[1]), Number(match[2])] : null
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
  const thirds = match.thirds.map(parsePair)
  if (thirds.length === 0 || thirds.some((pair) => pair === null)) return []

  const columns: PeriodColumn[] = (thirds as Array<[number, number]>).map(
    ([home, away], index) => ({
      label: String(index + 1),
      title: `${index + 1}. třetina`,
      home,
      away,
    }),
  )
  if (!match.suffix || !hasScore(match)) return columns

  const homeWins = match.homeScore > match.awayScore
  const ot = match.timeline.find((period) => /prodl/i.test(period.label))
  const otPair =
    parsePair(ot?.score) ?? (match.suffix === 'sn' ? [0, 0] : homeWins ? [1, 0] : [0, 1])
  const extra: PeriodColumn[] = [
    { label: 'P', title: 'Prodloužení', home: otPair[0], away: otPair[1] },
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

/** Klubové předpony, které v monogramu ani zkratce nic neříkají. */
const PREFIXES = new Set(['HC', 'HK', 'SK', 'TJ', 'HHK', 'ZH', 'HCM', 'SKP'])

const keyWord = (name: string): string => {
  const words = name.split(/\s+/).filter(Boolean)
  return words.find((word) => !PREFIXES.has(word.toUpperCase())) ?? words[0] ?? '?'
}

/** „HC Zdar" → „Z". */
export const monogram = (name: string): string => keyWord(name).charAt(0).toUpperCase()

/** Třípísmenná zkratka jako na TV tabuli: „HC Polička B" → „POL". */
export const teamCode = (name: string): string =>
  keyWord(name).slice(0, 3).toLocaleUpperCase('cs-CZ')

export const outcomeNote = (
  outcome: Outcome | null,
  suffix: MatchDetail['suffix'],
): string | null =>
  suffix ? SUFFIX_NOTE[suffix] : outcome === 'otLoss' ? 'po prodloužení nebo nájezdech' : null

/**
 * Znak týmu — dekorativní (`alt=""`), jméno stojí vždy vedle jako text.
 * Soupeř bez znaku dostane kroužek s monogramem, aby kompozice zůstala
 * souměrná. Velikost a tón (obrys) řídí volající přes `className`
 * a `tone`. Vnitřní okraj loga je pevný (`p-*`), ne v procentech —
 * procentní padding se počítá ze šířky rodiče, takže v buňce tabulky
 * logo zmizelo.
 */
export function Crest({
  logo,
  name,
  className,
  tone = 'dark',
  sizes = '96px',
  monogramClassName,
}: {
  logo: Photo | null
  name: string
  className?: string
  /** `dark` = na tmavé ploše (bílý podklad loga), `light` = na světlé (rámeček). */
  tone?: 'dark' | 'light' | 'club'
  sizes?: string
  monogramClassName?: string
}) {
  if (!logo) {
    return (
      <span
        aria-hidden
        className={cn(
          'grid flex-none place-items-center rounded-full border font-bold',
          tone === 'dark' && 'border-white/24 text-white/75',
          tone === 'light' && 'border-line bg-chip text-ink-soft',
          tone === 'club' && 'border-white/40 bg-white/10 text-white',
          className,
          monogramClassName,
        )}
      >
        {monogram(name)}
      </span>
    )
  }
  return (
    <Image
      alt=""
      aria-hidden
      className={cn(
        'flex-none rounded-full object-contain',
        tone === 'light' ? 'border border-line-soft bg-surface p-0.5' : 'bg-white/92 p-1',
        className,
      )}
      height={128}
      sizes={sizes}
      src={getMediaUrl(logo.url, logo.updatedAt)}
      width={128}
    />
  )
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
