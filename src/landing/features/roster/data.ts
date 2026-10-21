import 'server-only'

import { cache } from 'react'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import type { PlayerSeasonStat, RosterPlayer } from '@/landing/features/roster/types'
import { uploadToPhoto } from '@/landing/lib/media'
import type { Player } from '@/payload-types'

/** Hráči — fetchery pro soupisky a hráčské karty. */

/** Post hráče (select `G`/`D`/`F`) → český popisek. */
export const POSITION_LABEL: Record<string, string> = {
  G: 'Brankář',
  D: 'Obránce',
  F: 'Útočník',
}

/** Sekce soupisky /soupiska — skupina hráčů jednoho postu. */
export type RosterSection = {
  anchor: string
  title: string
  /** Krátký český podpis vpravo u nadpisu sekce (handoff má anglický, ten se do HTML nehodí). */
  kicker: string
  players: RosterPlayer[]
}

/** Player dokument → RosterPlayer VM. */
export function playerToRosterPlayer(player: Player): RosterPlayer {
  return {
    id: player.id,
    name: player.name,
    number: player.number ?? null,
    position: player.position ?? null,
    photo: uploadToPhoto(player.photo),
  }
}

/** Soupiska — aktivní hráči (starší záznamy bez příznaku bereme jako aktivní). */
export const fetchRoster = cache(async (): Promise<RosterPlayer[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'players',
    where: { active: { not_equals: false } },
    sort: 'name',
    limit: 0,
    depth: 1,
  })
  return docs.map(playerToRosterPlayer)
})

/** Uvnitř sekce: podle čísla vzestupně, bez čísla na konec podle jména. */
const bySectionOrder = (a: RosterPlayer, b: RosterPlayer): number => {
  if (a.number != null && b.number != null) return a.number - b.number
  if (a.number != null) return -1
  if (b.number != null) return 1
  return a.name.localeCompare(b.name, 'cs')
}

/**
 * Soupiska seskupená podle postu (Brankáři → Obránci → Útočníci).
 * Hráči bez vyplněného postu spadnou do závěrečné sekce „Hráči",
 * aby se ze stránky nikdy neztratili. Prázdné sekce se vynechají.
 */
export const fetchRosterSections = cache(async (): Promise<RosterSection[]> => {
  const roster = await fetchRoster()
  const groups: Array<Omit<RosterSection, 'players'> & { match: (p: RosterPlayer) => boolean }> = [
    { anchor: 'brankari', title: 'Brankáři', kicker: 'Gólmani', match: (p) => p.position === 'G' },
    { anchor: 'obranci', title: 'Obránci', kicker: 'Obrana', match: (p) => p.position === 'D' },
    { anchor: 'utocnici', title: 'Útočníci', kicker: 'Útok', match: (p) => p.position === 'F' },
    {
      anchor: 'hraci',
      title: 'Hráči',
      kicker: 'Ostatní',
      match: (p) => !p.position || !(p.position in POSITION_LABEL),
    },
  ]
  return groups
    .map(({ match, ...section }) => ({
      ...section,
      players: roster.filter(match).sort(bySectionOrder),
    }))
    .filter((section) => section.players.length > 0)
})

/** Vybraní hráči (v pořadí výběru). */
export const fetchPickedPlayers = cache(async (playerIds: number[]): Promise<RosterPlayer[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'players',
    where: { id: { in: playerIds } },
    limit: playerIds.length,
    depth: 1,
  })
  const byId = new Map(docs.map((player) => [player.id, player]))
  return playerIds
    .map((id) => byId.get(id))
    .filter((player): player is Player => Boolean(player))
    .map(playerToRosterPlayer)
})

/**
 * Statistiky hráčů za sezónu — součet `lineup` odehraných zápasů.
 *
 * Neukládají se na hráči: sezóna má ~20 zápasů, takže je levnější je
 * sečíst než udržovat odvozená pole v synchronizaci. Klíč mapy je ID
 * hráče (JSON z `unstable_cache` číselné klíče stejně převede na řetězce).
 * Hráč, který v žádném zápisu není, v mapě chybí — UI pak nic nezobrazí
 * místo řady nul.
 *
 * Tag `matches` + `revalidate`: viz AGENTS.md „Tři pravidla" — bez
 * `revalidate` má `unstable_cache` TTL rok. Žádné `new Date()` uvnitř.
 */
export const fetchPlayerSeasonStats = cachedQuery(
  async (seasonId: number): Promise<Record<string, PlayerSeasonStat>> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'matches',
      where: { and: [{ season: { equals: seasonId } }, { status: { equals: 'played' } }] },
      limit: 0,
      depth: 0,
      pagination: false,
      select: { lineup: { player: true, goals: true, assists: true, pim: true } },
    })

    const stats: Record<string, PlayerSeasonStat> = {}
    for (const match of docs) {
      for (const entry of match.lineup ?? []) {
        // Hráč mimo kolekci (host, nespárovaný) nemá soupisku, kam by se zapsal.
        if (typeof entry.player !== 'number') continue
        const stat = (stats[entry.player] ??= { games: 0, goals: 0, assists: 0, pim: 0 })
        stat.games += 1
        stat.goals += entry.goals ?? 0
        stat.assists += entry.assists ?? 0
        stat.pim += entry.pim ?? 0
      }
    }
    return stats
  },
  { key: 'player-season-stats', tags: [CACHE_TAGS.matches] },
)
