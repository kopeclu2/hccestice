import type { Season } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { STANDINGS } from '../content'
import type { StandingsContent, StatsContent } from '../types'

import { arrayOr, pluralForm } from './format'

/** Sezóny — aktuální sezóna, tabulka ligy a auto-výpočet čísel. */

/** „2025/26" ze startYear (title „2025 – 2026" by dal „2025/2026"). */
export const seasonShortLabel = (season: Pick<Season, 'startYear'>): string =>
  `${season.startYear}/${String(season.startYear + 1).slice(2)}`

/** Sezóny s alespoň jednou galerií, od nejnovější — filtr /fotogalerie. */
export const fetchGallerySeasons = cache(async (): Promise<Season[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs: galleries } = await payload.find({
    collection: 'galleries',
    limit: 0,
    depth: 0,
    select: { season: true },
  })
  const ids = [
    ...new Set(
      galleries
        .map((gallery) => (typeof gallery.season === 'number' ? gallery.season : null))
        .filter((id): id is number => Boolean(id)),
    ),
  ]
  if (ids.length === 0) return []

  const { docs } = await payload.find({
    collection: 'seasons',
    where: { id: { in: ids } },
    sort: '-startYear',
    limit: 0,
    depth: 0,
  })
  return docs
})

/** Sezóny s alespoň jedním zápasem, od nejnovější — filtr /zapasy. */
export const fetchMatchSeasons = cache(async (): Promise<Season[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs: matches } = await payload.find({
    collection: 'matches',
    limit: 0,
    depth: 0,
    select: { season: true },
  })
  const ids = [
    ...new Set(
      matches
        .map((match) => (typeof match.season === 'number' ? match.season : null))
        .filter((id): id is number => Boolean(id)),
    ),
  ]
  if (ids.length === 0) return []

  const { docs } = await payload.find({
    collection: 'seasons',
    where: { id: { in: ids } },
    sort: '-startYear',
    limit: 0,
    depth: 0,
  })
  return docs
})

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
