import type { Season } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import { STANDINGS } from '../content'
import type { StandingsContent, StatsContent } from '../types'

import { arrayOr, pluralForm } from './format'
import { CACHE_TAGS } from './tags'

/** Sezóny — aktuální sezóna, tabulka ligy a auto-výpočet čísel. */

/** „2025/26" ze startYear (title „2025 – 2026" by dal „2025/2026"). */
export const seasonShortLabel = (season: Pick<Season, 'startYear'>): string =>
  `${season.startYear}/${String(season.startYear + 1).slice(2)}`

/**
 * Sezóny, ve kterých existuje aspoň jeden dokument dané kolekce —
 * pilulky filtru na `/fotogalerie` a `/zapasy`.
 *
 * `DISTINCT season` se skládá v aplikaci, ne v SQL: Payload `find` nic
 * takového neumí a `select` zúží dotaz na jediný sloupec, takže je to
 * jeden index scan. Obě volající stránky jsou ale **plně dynamické**
 * (`searchParams`), takže bez `unstable_cache` níž tenhle scan padal na
 * každé načtení výpisu, včetně stránkování.
 */
const loadSeasonsWithDocs = async (collection: 'galleries' | 'matches'): Promise<Season[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection,
    limit: 0,
    depth: 0,
    select: { season: true },
  })
  const ids = [
    ...new Set(
      docs
        .map((doc) => (typeof doc.season === 'number' ? doc.season : null))
        .filter((id): id is number => Boolean(id)),
    ),
  ]
  if (ids.length === 0) return []

  const { docs: seasons } = await payload.find({
    collection: 'seasons',
    where: { id: { in: ids } },
    sort: '-startYear',
    limit: 0,
    depth: 0,
  })
  return seasons
}

const loadGallerySeasons = unstable_cache(
  async (): Promise<Season[]> => loadSeasonsWithDocs('galleries'),
  ['gallery-seasons'],
  { tags: [CACHE_TAGS.galleries], revalidate: 3600 },
)

const loadMatchSeasons = unstable_cache(
  async (): Promise<Season[]> => loadSeasonsWithDocs('matches'),
  ['match-seasons'],
  { tags: [CACHE_TAGS.matches], revalidate: 3600 },
)

/** Sezóny s alespoň jednou galerií, od nejnovější — filtr /fotogalerie. */
export const fetchGallerySeasons = cache(async (): Promise<Season[]> => loadGallerySeasons())

/** Sezóny s alespoň jedním zápasem, od nejnovější — filtr /zapasy. */
export const fetchMatchSeasons = cache(async (): Promise<Season[]> => loadMatchSeasons())

/** Sezóna podle id, jinak aktuální (`isCurrent`). */
export const fetchSeason = cache(async (seasonId?: number | null): Promise<Season | null> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'seasons',
    where: seasonId ? { id: { equals: seasonId } } : { isCurrent: { equals: true } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

/** Tabulka ligy z dokumentu sezóny (Sezóny → Tabulka ligy). */
export function mapStandingsFromSeason(season: Season | null): StandingsContent {
  return {
    seasonLabel: season?.standings?.label ?? STANDINGS.seasonLabel,
    fullTableUrl: season?.standings?.fullTableUrl ?? STANDINGS.fullTableUrl,
    rows: arrayOr(season?.standings?.rows, [...STANDINGS.rows], (row) => ({
      pos: row.pos,
      team: row.team,
      games: row.games ?? 0,
      points: row.points ?? 0,
    })),
  }
}

/**
 * Auto-výpočet „Sezóna v číslech": umístění a body z tabulky sezóny,
 * nejdelší série výher ze zápasů, počet hráčů ze soupisky.
 * Použije se, když blok nemá ruční čísla.
 *
 * Nulové hodnoty se zobrazují taky — na začátku sezóny je „0 výher v řadě"
 * informace, zmizelá dlaždice vypadá jako chyba. Popisky se proto skloňují.
 */
export const fetchAutoStats = cache(
  async (seasonId?: number | null): Promise<StatsContent | null> => {
    const season = await fetchSeason(seasonId)
    if (!season) return null

    const payload = await getPayload({ config: configPromise })
    const items: StatsContent['items'] = []

    const ourRow = (season.standings?.rows ?? []).find((row) => row.team.includes('Čestice'))
    if (ourRow) {
      items.push({ value: `${ourRow.pos}.`, label: 'místo v tabulce VČHL', accent: false })
      const points = ourRow.points ?? 0
      items.push({
        value: String(points),
        label: `${pluralForm(points, ['bod', 'body', 'bodů'])} v základní části`,
        accent: true,
      })
    }

    const { docs: played } = await payload.find({
      collection: 'matches',
      where: {
        and: [{ status: { equals: 'played' } }, { season: { equals: season.id } }],
      },
      sort: 'date',
      limit: 0,
      depth: 0,
    })
    let streak = 0
    let bestStreak = 0
    for (const match of played) {
      streak = (match.scoreOurs ?? 0) > (match.scoreOpp ?? 0) ? streak + 1 : 0
      bestStreak = Math.max(bestStreak, streak)
    }
    items.push({
      value: String(bestStreak),
      label: `${pluralForm(bestStreak, ['výhra', 'výhry', 'výher'])} v řadě`,
      accent: false,
    })

    const { totalDocs: playerCount } = await payload.count({
      collection: 'players',
      where: { active: { not_equals: false } },
    })
    items.push({
      value: String(playerCount),
      label: `${pluralForm(playerCount, ['hráč', 'hráči', 'hráčů'])} na soupisce`,
      accent: false,
    })

    return { seasonLabel: season.title.replace(/\s*–\s*/, '/'), items }
  },
)
