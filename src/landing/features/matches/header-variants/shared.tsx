import React from 'react'

import { OUTCOME_BADGE } from '@/landing/features/matches/components/outcome'
import type { MatchDetail, Outcome } from '@/landing/features/matches/types'
import {
  outcomeNote,
  type ScorePair,
  type ScoreSuffix,
  sideLabel,
  SUFFIX_NOTE,
} from '@/landing/features/matches/view/matchFormat'
import { Badge } from '@/landing/ui/Badge'
import { Eyebrow } from '@/landing/ui/Kicker'
import { weekdayLong } from '@/lib/datetime'
import { cn } from '@/lib/utils'

/**
 * Sdílená logika a drobné díly variant hlavičky detailu zápasu. Kterou
 * variantu detail vykreslí, volí správce v Nastavení webu
 * (`matchHeaderVariant`, přepínač `MatchHeaderByVariant` v `index.tsx`);
 * katalog všech je na `/vzory/hlavicka-zapasu`. Údaje (`MetaItem`) a štítek
 * výsledku (`OutcomeBadge`) používá i původní `MatchHeader` (`classic`),
 * jeho tabule (`MatchScoreboard`) se s variantami nesdílí.
 */

/**
 * Zápas, který varianty umí vykreslit. Zrušený má vždy původní `MatchHeader`
 * (`CanceledHeader`), varianty ho umět nemusí a katalog ho nezobrazuje.
 */
export type VariantMatch = MatchDetail & { status: 'scheduled' | 'played' }

export const isVariantMatch = (match: MatchDetail): match is VariantMatch =>
  match.status !== 'canceled'

export type HeaderVariantProps = {
  match: VariantMatch
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

/**
 * Den v týdnu s velkým písmenem („Sobota") — data v CMS ho nenesou, odvozuje
 * se z ISO v Europe/Prague. Velké písmeno je v textu, ne ve třídě `capitalize`,
 * aby ho šlo použít i v řetězci (`MatchMeta`).
 */
export const weekdayLabel = (iso: string): string | null => {
  const day = weekdayLong(iso)
  return day ? `${day.charAt(0).toLocaleUpperCase('cs-CZ')}${day.slice(1)}` : null
}

export type PeriodColumn = ScorePair & {
  /** Krátký popisek sloupce: „1", „2", „3", „P", „SN". */
  label: string
  /** Dlouhý popisek pro čtečky. */
  title: string
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
  const sum = (side: 'home' | 'away') => all.reduce((total, column) => total + column[side], 0)
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

/**
 * Položka řádku údajů (`<dl>`): popisek a hodnota. Vzhled volí varianta:
 * `dark` = na tmavé ploše, `light` = na světlé, `compact` = husté postranní
 * sloupce (menší odsazení, těsný popisek).
 */
const META_ITEM_VALUE = {
  dark: 'mt-1 text-sm font-semibold [overflow-wrap:anywhere] text-on-contrast md:text-base',
  light: 'mt-1 text-sm font-semibold [overflow-wrap:anywhere] md:text-base',
  compact: 'mt-0.5 text-sm font-semibold [overflow-wrap:anywhere]',
} as const

export function MetaItem({
  label,
  children,
  className,
  look = 'dark',
}: {
  label: string
  children: React.ReactNode
  className?: string
  look?: keyof typeof META_ITEM_VALUE
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt>
        <Eyebrow tight={look === 'compact'} tone={look === 'dark' ? 'white' : undefined}>
          {label}
        </Eyebrow>
      </dt>
      <dd className={META_ITEM_VALUE[look]}>{children}</dd>
    </div>
  )
}

/**
 * Štítek výsledku z pohledu Čestic. Poznámku („po nájezdech") ukáže jako
 * text vedle štítku, když dostane `noteClassName`; `noteAsTitle` ji dá do
 * `title` štítku (tooltip) a bez obojího se nezobrazí. Vrací fragment —
 * rozložení (řádek / blok) určuje volající.
 */
export function OutcomeBadge({
  outcome,
  suffix,
  size = 'sm',
  noteClassName,
  noteAsTitle = false,
}: {
  outcome: Outcome
  suffix: ScoreSuffix
  size?: 'xs' | 'sm'
  noteClassName?: string
  noteAsTitle?: boolean
}) {
  const badge = OUTCOME_BADGE[outcome]
  const note = outcomeNote(outcome, suffix)
  return (
    <>
      <Badge
        size={size}
        title={noteAsTitle ? (note ?? undefined) : undefined}
        variant={badge.variant}
      >
        {badge.label}
      </Badge>
      {note && noteClassName && <span className={noteClassName}>{note}</span>}
    </>
  )
}

/** Strana, na které hrajeme: „Doma" / „Venku" jako štítek. */
export function SideBadge({
  weAreHome,
  size = 'sm',
  look,
}: {
  weAreHome: boolean
  size?: 'xs' | 'sm'
  look: 'dark' | 'light'
}) {
  const label = sideLabel(weAreHome)
  return look === 'dark' ? (
    <Badge caps size={size} variant={weAreHome ? 'lime' : 'glassOutline'}>
      {label}
    </Badge>
  ) : (
    <Badge size={size} variant={weAreHome ? 'club' : 'chip'}>
      {label}
    </Badge>
  )
}

/** „Konec" nebo „Konec · po nájezdech" — stav odehraného zápasu. */
export function EndBadge({ suffix, look }: { suffix: ScoreSuffix; look: 'dark' | 'light' }) {
  const text = `Konec${suffix ? ` · ${SUFFIX_NOTE[suffix]}` : ''}`
  return look === 'dark' ? (
    <Badge caps className="gap-2 text-on-contrast-soft" size="xs" variant="glassOutline">
      <span aria-hidden className="size-1.5 rounded-full bg-on-contrast-subtle" />
      {text}
    </Badge>
  ) : (
    <Badge size="xs" variant="chip">
      {text}
    </Badge>
  )
}

/** Stavový štítek: naplánovaný zápas ukáže stranu, odehraný „Konec". */
export function StatusBadge({ match, look }: { match: VariantMatch; look: 'dark' | 'light' }) {
  return match.status === 'scheduled' ? (
    <SideBadge look={look} size="xs" weAreHome={match.weAreHome} />
  ) : (
    <EndBadge look={look} suffix={match.suffix} />
  )
}
