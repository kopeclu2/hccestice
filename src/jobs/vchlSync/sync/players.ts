import { normalizeName } from '@/ahl'

import { buildPatch } from '../diff'

import type { SyncContext } from './ctx'

export type PlayerCandidate = {
  ahlPlayerId: number | null
  /** „Jméno Příjmení" (výstup parserů už je v tomto tvaru) */
  name: string
  number: number | null
  goalie: boolean
}

export type PlayerLike = {
  id: number
  name: string
  number?: number | null
  ahlPlayerId?: number | null
  position?: string | null
}

export type PlayerOutcome =
  | { kind: 'matched'; player: PlayerLike }
  | { kind: 'ambiguous'; players: PlayerLike[] }
  | { kind: 'none' }

const nameKey = (name: string) => normalizeName(name, 'first-last')

/**
 * Párování hráče z AHL na hráče v CMS. Primární klíč je `hracid`, jméno je
 * jen záloha pro hráče, které seed skripty založily bez ID.
 *
 * Kandidáti podle jména jsou jen hráči BEZ `ahlPlayerId`, když ho kandidát
 * má: hráč s jiným ID je jiný člověk (dva „Sajdl Lukáš"). Víc shod = žádné
 * párování — lepší ruční zásah než statistika připsaná jinému hráči.
 */
export function matchPlayer(c: PlayerCandidate, players: PlayerLike[]): PlayerOutcome {
  if (c.ahlPlayerId != null) {
    const byId = players.find((p) => p.ahlPlayerId === c.ahlPlayerId)
    if (byId) return { kind: 'matched', player: byId }
  }
  const key = nameKey(c.name)
  if (!key) return { kind: 'none' }
  const pool = c.ahlPlayerId != null ? players.filter((p) => p.ahlPlayerId == null) : players
  const hits = pool.filter((p) => nameKey(p.name) === key)
  if (hits.length === 1) return { kind: 'matched', player: hits[0] }
  if (hits.length > 1) return { kind: 'ambiguous', players: hits }
  return { kind: 'none' }
}

export type PlayerResolver = {
  ensure(candidates: PlayerCandidate[]): Promise<void>
  /** id hráče v CMS, nebo null (neznámý / nejednoznačný / ještě nezaložený v nanečisto) */
  idFor(ahlPlayerId: number | null, name: string): number | null
  ahlIdOf(id: number): number | null
}

const validNumber = (n: number | null | undefined): n is number => n != null && n >= 1 && n <= 99

export async function createPlayerResolver(ctx: SyncContext): Promise<PlayerResolver> {
  const players: PlayerLike[] = (
    await ctx.payload.find({ collection: 'players', limit: 0, depth: 0 })
  ).docs.map((d) => ({
    id: d.id,
    name: d.name,
    number: d.number,
    ahlPlayerId: d.ahlPlayerId,
    position: d.position,
  }))
  const resolved = new Map<string, number | null>()
  const idKey = (id: number) => `id:${id}`

  function merge(cands: PlayerCandidate[]): PlayerCandidate[] {
    const map = new Map<string, PlayerCandidate>()
    for (const c of cands) {
      const k = c.ahlPlayerId != null ? idKey(c.ahlPlayerId) : `n:${nameKey(c.name)}`
      const prev = map.get(k)
      map.set(
        k,
        prev
          ? { ...prev, number: prev.number ?? c.number, goalie: prev.goalie || c.goalie }
          : { ...c },
      )
    }
    return [...map.values()]
  }

  return {
    ahlIdOf: (id) => players.find((p) => p.id === id)?.ahlPlayerId ?? null,

    idFor(ahlPlayerId, name) {
      if (ahlPlayerId != null) {
        const byId = players.find((p) => p.ahlPlayerId === ahlPlayerId)
        if (byId) return byId.id
        const r = resolved.get(idKey(ahlPlayerId))
        if (r !== undefined) return r
      }
      return resolved.get(`n:${nameKey(name)}`) ?? null
    },

    async ensure(candidates) {
      for (const c of merge(candidates)) {
        const key = c.ahlPlayerId != null ? idKey(c.ahlPlayerId) : `n:${nameKey(c.name)}`
        if (resolved.has(key)) continue
        const ref = c.ahlPlayerId != null ? String(c.ahlPlayerId) : c.name
        const out = matchPlayer(c, players)

        if (out.kind === 'ambiguous') {
          ctx.warn({
            type: 'ambiguous-player',
            ref,
            message: `Hráči „${c.name}" (AHL ${c.ahlPlayerId ?? 'bez ID'}) odpovídá víc hráčů v CMS (${out.players
              .map((p) => `#${p.id}`)
              .join(', ')}). Nespárováno — doplňte ahlPlayerId ručně.`,
          })
          resolved.set(key, null)
          continue
        }

        if (out.kind === 'matched') {
          const p = out.player
          const desired: Record<string, unknown> = {}
          if (c.ahlPlayerId != null && p.ahlPlayerId == null) desired.ahlPlayerId = c.ahlPlayerId
          if (p.number == null && validNumber(c.number)) desired.number = c.number
          const { patch, fields, before, after } = buildPatch(
            p as unknown as Record<string, unknown>,
            desired,
          )
          if (fields.length > 0) {
            ctx.recordDiff({
              entity: 'players',
              key: `player:${p.id}`,
              label: p.name,
              action: 'update',
              fields,
              before,
              after,
            })
            await ctx.update('players', p.id, patch)
            ctx.changes.playersUpdated += 1
            Object.assign(p, patch)
          }
          resolved.set(key, p.id)
          continue
        }

        // Neznámý hráč: založit neaktivní — na soupisku ho správce zařadí sám.
        const data: Record<string, unknown> = { name: c.name, active: false }
        if (c.ahlPlayerId != null) data.ahlPlayerId = c.ahlPlayerId
        if (validNumber(c.number)) data.number = c.number
        if (c.goalie) data.position = 'G'
        ctx.warn({
          type: 'unknown-player',
          ref,
          message: `Hráč „${c.name}" (AHL ${c.ahlPlayerId ?? 'bez ID'}) v CMS nebyl, založen jako neaktivní.`,
        })
        ctx.recordDiff({
          entity: 'players',
          key: c.ahlPlayerId != null ? `ahlPlayer:${c.ahlPlayerId}` : `player:${c.name}`,
          label: c.name,
          action: 'create',
          fields: Object.keys(data),
          after: data,
        })
        const created = await ctx.create('players', data)
        ctx.changes.playersCreated += 1
        const id = Number.isNaN(created.id) ? null : created.id
        if (id != null) {
          players.push({
            id,
            name: c.name,
            number: validNumber(c.number) ? c.number : null,
            ahlPlayerId: c.ahlPlayerId,
            position: c.goalie ? 'G' : null,
          })
        }
        resolved.set(key, id)
      }
    },
  }
}
