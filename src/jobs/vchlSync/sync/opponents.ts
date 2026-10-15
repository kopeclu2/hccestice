import { fold } from '@/lib/fold'
import { stripClubPrefix } from '@/lib/teamName'
import type { Opponent } from '@/payload-types'

import type { SyncContext } from './ctx'

/** Klíč pro porovnání názvů týmů: bez diakritiky, velikosti písmen a interpunkce. */
export const foldTeam = (s: string): string => fold(s, { alnumOnly: true })

/**
 * Most z historického importu zápasů (seed skripty už v repu nejsou):
 * plné názvy ze stránek zápasů → název soupeře v CMS. Při prvním zjištění se
 * přepíše do `opponents.aliases`, takže hardcode slouží jen jednou a po
 * backfillu jde smazat.
 */
const LEGACY_ALIASES: Record<string, string> = {
  aloha: 'HC Aloha Lanškroun',
  'aloha lanskroun': 'HC Aloha Lanškroun',
  'hc aloha lanskroun': 'HC Aloha Lanškroun',
  'baroni opocno': 'HC Opočno',
  'hc baroni opocno': 'HC Opočno',
  rebels: 'Rebels Polička',
  'rebels policka': 'Rebels Polička',
  'hc stavoblock rebels policka': 'Rebels Polička',
  'hc spartak policka b': 'HC Polička B',
  'zavodni hokejova pardubice': 'ZH Pardubice',
  'hc spartak chocen b': 'HC Choceň B',
}

/** Všechny klíče, pod kterými lze soupeře poznat (název, aliasy, bez předpon: „HC Polička B" a „Polička B" jsou pro AHL tentýž tým). */
export function opponentKeys(opp: Pick<Opponent, 'name' | 'aliases'>): Set<string> {
  const keys = new Set<string>()
  for (const raw of [opp.name, ...(opp.aliases ?? []).map((a) => a.name)]) {
    if (!raw) continue
    const f = foldTeam(raw)
    keys.add(f)
    keys.add(stripClubPrefix(f))
  }
  return keys
}

export function ahlNameKeys(name: string): Set<string> {
  const f = foldTeam(name)
  return new Set([f, stripClubPrefix(f)])
}

export function keysIntersect(a: Set<string>, b: Set<string>): boolean {
  for (const k of a) if (b.has(k)) return true
  return false
}

export type OpponentResolver = {
  /** id soupeře; `NaN` = bude založen (nanečisto) */
  resolve(ahlName: string): Promise<number>
  byId(id: number): Opponent | undefined
}

export async function createOpponentResolver(ctx: SyncContext): Promise<OpponentResolver> {
  const docs = (await ctx.payload.find({ collection: 'opponents', limit: 0, depth: 0 })).docs
  const byIdMap = new Map<number, Opponent>(docs.map((d) => [d.id, d]))
  const exact = new Map<string, number>()
  const addExact = (d: Opponent) => {
    for (const raw of [d.name, ...(d.aliases ?? []).map((a) => a.name)]) {
      if (raw) exact.set(foldTeam(raw), d.id)
    }
  }
  docs.forEach(addExact)
  const resolved = new Map<string, number>()

  async function addAlias(opp: Opponent, alias: string) {
    const aliases = [...(opp.aliases ?? []).map((a) => ({ name: a.name })), { name: alias }]
    ctx.recordDiff({
      entity: 'opponents',
      key: `opponent:${opp.id}`,
      label: opp.name,
      action: 'update',
      fields: ['aliases'],
      before: { aliases: opp.aliases?.map((a) => a.name) ?? [] },
      after: { aliases: aliases.map((a) => a.name) },
    })
    await ctx.update('opponents', opp.id, { aliases })
    // Index se aktualizuje i v nanečisto, ať se alias nehlásí podruhé.
    byIdMap.set(opp.id, { ...opp, aliases } as Opponent)
    exact.set(foldTeam(alias), opp.id)
  }

  return {
    byId: (id) => byIdMap.get(id),
    async resolve(ahlName) {
      const key = foldTeam(ahlName)
      const cached = resolved.get(key)
      if (cached !== undefined) return cached

      let id = exact.get(key)

      if (id === undefined) {
        // Stejný tým bez předpony klubu („Pardubice" ↔ „ZH Pardubice").
        // Jen když je shoda jednoznačná, jinak by se zápas přiřadil bez záruky.
        const mine = ahlNameKeys(ahlName)
        const hits = docs.filter((d) => keysIntersect(mine, opponentKeys(d)))
        if (hits.length === 1) {
          id = hits[0].id
          await addAlias(hits[0], ahlName)
        }
      }

      if (id === undefined && LEGACY_ALIASES[key]) {
        const canonical = foldTeam(LEGACY_ALIASES[key])
        const hit = docs.find((d) => foldTeam(d.name) === canonical)
        if (hit) {
          id = hit.id
          await addAlias(hit, ahlName)
        }
      }

      if (id === undefined) {
        const slug = key.replace(/\s+/g, '-')
        ctx.warn({
          type: 'unknown-opponent',
          ref: ahlName,
          message: `Soupeř „${ahlName}" v CMS nebyl, založen nový.`,
        })
        ctx.recordDiff({
          entity: 'opponents',
          key: `opponent:${slug}`,
          label: ahlName,
          action: 'create',
          fields: ['name', 'aliases'],
          after: { name: ahlName, aliases: [ahlName] },
        })
        const created = await ctx.create('opponents', {
          name: ahlName,
          slug,
          generateSlug: false,
          aliases: [{ name: ahlName }],
        })
        ctx.changes.opponentsCreated += 1
        id = created.id
        exact.set(key, id)
        if (!Number.isNaN(id)) byIdMap.set(id, created as unknown as Opponent)
      }

      resolved.set(key, id)
      return id
    },
  }
}
