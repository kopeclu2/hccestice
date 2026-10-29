import 'server-only'

import { cache } from 'react'

import { isOurTeam } from '@/ahl/ourTeam'
import { STANDINGS } from '@/landing/content'
import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import type { StandingsContent } from '@/landing/features/matches/types'
import { formatCompetition } from '@/landing/features/matches/view/matchFormat'
import type { StatsContent } from '@/landing/types'
import { VISIBLE_MATCH } from '@/lib/matchVisibility'
import { plural } from '@/lib/plural'
import type { Season } from '@/payload-types'

import { seasonShortLabel } from './seasonLabel'

/** Sezóny — aktuální sezóna, tabulka ligy a auto-výpočet čísel. */

// Popisek sezóny žije v `seasonLabel.ts` (čistý, bez Payloadu); re-export kvůli dosavadním importům.
export { seasonShortLabel }

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
  const payload = await getPayloadClient()
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

/** Sezóny s alespoň jednou galerií, od nejnovější — filtr /fotogalerie. */
export const fetchGallerySeasons = cachedQuery(
  async (): Promise<Season[]> => loadSeasonsWithDocs('galleries'),
  { key: 'gallery-seasons', tags: [CACHE_TAGS.galleries] },
)

/** Sezóny s alespoň jedním zápasem, od nejnovější — filtr /zapasy. */
export const fetchMatchSeasons = cachedQuery(
  async (): Promise<Season[]> => loadSeasonsWithDocs('matches'),
  { key: 'match-seasons', tags: [CACHE_TAGS.matches] },
)

/** Sezóna podle id, jinak aktuální (`isCurrent`). */
export const fetchSeason = cache(async (seasonId?: number | null): Promise<Season | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'seasons',
    where: seasonId ? { id: { equals: seasonId } } : { isCurrent: { equals: true } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

/**
 * Tabulka ligy z dokumentu sezóny (Sezóny → Tabulka ligy).
 *
 * Bez vyplněných řádků vrací `rows: []` — nedosazuje demo tabulku ze
 * `STANDINGS`, ta je jen fallback pro popisek/odkaz, kdyby žádná sezóna
 * nešla dohledat vůbec. Prázdné řádky si dál řeší vlastní prázdný stav
 * v `StandingsPanel`/`StandingsCard`, jinak by se pod čerstvou sezónou bez
 * tabulky zobrazila cizí čísla z předchozí sezóny jako by byla aktuální.
 */
export function mapStandingsFromSeason(season: Season | null): StandingsContent {
  return {
    seasonLabel:
      formatCompetition(season?.standings?.label) ??
      (season ? `základní část ${seasonShortLabel(season)}` : STANDINGS.seasonLabel),
    fullTableUrl: season?.standings?.fullTableUrl ?? STANDINGS.fullTableUrl,
    rows: (season?.standings?.rows ?? []).map((row) => ({
      pos: row.pos,
      team: row.team,
      games: row.games ?? 0,
      points: row.points ?? 0,
      // Rozšířené sloupce jen když je synchronizace vyplnila — `null`
      // z databáze se na `undefined` mapuje, aby `StandingsPanel` poznal,
      // že ručně vedená sezóna je nemá, a nekreslil sloupce nul.
      ...(row.wins != null && { wins: row.wins }),
      ...(row.otWins != null && { otWins: row.otWins }),
      ...(row.otLosses != null && { otLosses: row.otLosses }),
      ...(row.losses != null && { losses: row.losses }),
      ...(row.goalsFor != null && { goalsFor: row.goalsFor }),
      ...(row.goalsAgainst != null && { goalsAgainst: row.goalsAgainst }),
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

    const payload = await getPayloadClient()
    const items: StatsContent['items'] = []

    const ourRow = (season.standings?.rows ?? []).find((row) => isOurTeam(row.team))
    if (ourRow) {
      items.push({ value: `${ourRow.pos}.`, label: 'místo v tabulce VČHL', accent: false })
      const points = ourRow.points ?? 0
      items.push({
        value: String(points),
        label: `${plural(points, ['bod', 'body', 'bodů'])} v základní části`,
        accent: true,
      })
    }

    const { docs: played } = await payload.find({
      collection: 'matches',
      where: {
        and: [VISIBLE_MATCH, { status: { equals: 'played' } }, { season: { equals: season.id } }],
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
      label: `${plural(bestStreak, ['výhra', 'výhry', 'výher'])} v řadě`,
      accent: false,
    })

    const { totalDocs: playerCount } = await payload.count({
      collection: 'players',
      where: { active: { not_equals: false } },
    })
    items.push({
      value: String(playerCount),
      label: `${plural(playerCount, ['hráč', 'hráči', 'hráčů'])} na soupisce`,
      accent: false,
    })

    return { seasonLabel: season.title.replace(/\s*–\s*/, '/'), items }
  },
)
