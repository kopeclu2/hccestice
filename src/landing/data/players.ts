import type { Player } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { RosterPlayer } from '../types'

import { toPhoto } from './format'

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
  /** Anglický kicker vpravo u nadpisu sekce (podpis designu). */
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
    photo: typeof player.photo === 'object' && player.photo ? toPhoto(player.photo) : null,
  }
}

/** Soupiska — aktivní hráči (starší záznamy bez příznaku bereme jako aktivní). */
export const fetchRoster = cache(async (): Promise<RosterPlayer[]> => {
  const payload = await getPayload({ config: configPromise })
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
    { anchor: 'brankari', title: 'Brankáři', kicker: 'Goalies', match: (p) => p.position === 'G' },
    { anchor: 'obranci', title: 'Obránci', kicker: 'Defense', match: (p) => p.position === 'D' },
    { anchor: 'utocnici', title: 'Útočníci', kicker: 'Forwards', match: (p) => p.position === 'F' },
    { anchor: 'hraci', title: 'Hráči', kicker: 'Players', match: (p) => !p.position || !(p.position in POSITION_LABEL) },
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
  const payload = await getPayload({ config: configPromise })
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
