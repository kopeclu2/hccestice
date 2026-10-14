import type { AhlListMatch, AhlMatchDetail } from '@/ahl'
import { isOurTeam } from '@/ahl'
import type { Match } from '@/payload-types'

import type { SeasonCtx } from '../context'
import { buildPatch } from '../diff'
import { span } from '../sentry'
import { pragueLocalToUtc, utcToPragueLocal } from '../time'
import type { SyncContext } from './ctx'
import {
  buildGoals,
  buildLineup,
  buildThirds,
  fetchMatchDetail,
  ourCandidates,
  ourSide,
} from './matchDetail'
import { ahlNameKeys, keysIntersect, opponentKeys, type OpponentResolver } from './opponents'
import type { PlayerResolver } from './players'

const DAY_MS = 86_400_000
/** Okno, ve kterém se u odehraného zápasu dál stahuje detail (pozdní opravy zápisu). */
export const RECENT_DAYS = 7

export type SeasonLists = {
  /** `null` = část Rozlosování je vypnutá */
  rozpis: AhlListMatch[] | null
  /** `null` = část Výsledky je vypnutá */
  vysledky: AhlListMatch[] | null
}

/** Zápas z rozpisu a/nebo z výsledků, sloučený podle `zapasid`. */
export type ListEntry = { matchId: number; rozpis?: AhlListMatch; vysledky?: AhlListMatch }

export type DraftCandidate = { doc: Match; detail: AhlMatchDetail }

export type SeasonMatchState = {
  /** zápasy mužů v sezóně po zápisu (v nanečisto po „virtuálním" zápisu) */
  docs: Match[]
  /** detaily stažené v tomto běhu — `statsCheck` je použije místo DB */
  details: Map<number, AhlMatchDetail>
}

const isOurs = (m: AhlListMatch) => isOurTeam(m.home.name) || isOurTeam(m.away.name)

export function mergeLists(lists: SeasonLists): ListEntry[] {
  const map = new Map<number, ListEntry>()
  for (const [key, rows] of [
    ['rozpis', lists.rozpis],
    ['vysledky', lists.vysledky],
  ] as const) {
    for (const m of rows ?? []) {
      if (!isOurs(m)) continue
      const e = map.get(m.matchId) ?? { matchId: m.matchId }
      e[key] = m
      map.set(m.matchId, e)
    }
  }
  return [...map.values()]
}

const relId = (v: unknown): number | null =>
  v == null ? null : typeof v === 'object' ? ((v as { id: number }).id ?? null) : (v as number)

/**
 * Datum zápasu v UTC. Pořadí důvěryhodnosti: rozpis (má čas) → detail
 * (má čas) → výsledky (jen den). Výpis výsledků čas NEMÁ (`T00:00:00`), takže
 * se z něj čas nikdy nepřepisuje — jinak by každý odehraný zápas „skočil"
 * na půlnoc.
 */
export function resolveMatchDate(
  entry: ListEntry,
  detail: AhlMatchDetail | null,
  existing: Pick<Match, 'date'> | null,
): Date {
  if (entry.rozpis?.timeKnown) return pragueLocalToUtc(entry.rozpis.dateISO)
  if (detail?.dateISO && !detail.dateISO.endsWith('T00:00:00')) return pragueLocalToUtc(detail.dateISO)
  const base = entry.vysledky ?? entry.rozpis!
  const day = base.dateISO.slice(0, 10)
  if (existing) {
    const local = utcToPragueLocal(existing.date)
    if (local.day === day) return new Date(existing.date)
    return pragueLocalToUtc(`${day}T${local.time}:00`)
  }
  return pragueLocalToUtc(`${day}T00:00:00`)
}

/**
 * Zápas bez `ahl.matchId` (ze seed skriptů) se páruje podle sezóny + dne +
 * soupeře — stejný klíč, jaký seedy používaly. Soupeř se porovnává tolerantně
 * (v CMS se vyskytují duplicity typu „HC Skuteč" / „Skuteč"). Když se nepozná
 * podle názvu, párují se jen zápasy, které jsou jediné v ten den, mají stejnou
 * stranu (doma/venku) a neodporuje jim skóre.
 */
export function pairLegacy(
  entry: ListEntry,
  candidates: Match[],
  opponents: Pick<OpponentResolver, 'byId'>,
): Match | null {
  const base = entry.vysledky ?? entry.rozpis!
  const weAreHome = isOurTeam(base.home.name)
  const oppName = weAreHome ? base.away.name : base.home.name
  const day = base.dateISO.slice(0, 10)

  const sameDay = candidates.filter(
    (d) => utcToPragueLocal(d.date).day === day && Boolean(d.home) === weAreHome,
  )
  const mine = ahlNameKeys(oppName)
  const byName = sameDay.find((d) => {
    const opp = opponents.byId(relId(d.opponent) ?? -1)
    return opp ? keysIntersect(mine, opponentKeys(opp)) : false
  })
  if (byName) return byName

  if (sameDay.length === 1) {
    const d = sameDay[0]
    const score = entry.vysledky?.score
    const consistent =
      !score || d.scoreOurs == null || d.scoreOpp == null ||
      (weAreHome ? [score.home, score.away] : [score.away, score.home]).join(':') === `${d.scoreOurs}:${d.scoreOpp}`
    if (consistent) return d
  }
  return null
}

type Item = {
  entry: ListEntry
  weAreHome: boolean
  opponentName: string
  existing: Match | null
  /** existující zápas bez matchId spárovaný podle dne a soupeře */
  legacy: boolean
  opponentId: number
  detail: AhlMatchDetail | null
}

export async function syncSeasonMatches(
  ctx: SyncContext,
  season: SeasonCtx,
  lists: SeasonLists,
  opponents: OpponentResolver,
  players: PlayerResolver,
  drafts: DraftCandidate[],
): Promise<SeasonMatchState> {
  const entries = mergeLists(lists)
  const allListedIds = new Set([...(lists.rozpis ?? []), ...(lists.vysledky ?? [])].map((m) => m.matchId))

  // Zápasy sezóny v DB (muži). `matchId` je unikátní napříč sezónami, takže
  // se hledá i mimo sezónu — zápas přeřazený do jiné sezóny se nezduplikuje.
  const seasonDocs = (
    await ctx.payload.find({
      collection: 'matches',
      where: { and: [{ season: { equals: season.id } }, { team: { equals: ctx.teamId } }] },
      limit: 0,
      depth: 0,
    })
  ).docs
  const byMatchId = new Map<number, Match>()
  for (const d of seasonDocs) if (d.ahl?.matchId != null) byMatchId.set(d.ahl.matchId, d)
  const outside = entries.map((e) => e.matchId).filter((id) => !byMatchId.has(id))
  if (outside.length > 0) {
    const found = await ctx.payload.find({
      collection: 'matches',
      where: { 'ahl.matchId': { in: outside } },
      limit: 0,
      depth: 0,
    })
    for (const d of found.docs) byMatchId.set(d.ahl!.matchId!, d)
  }
  const legacyPool = seasonDocs.filter((d) => d.ahl?.matchId == null)
  const claimed = new Set<number>()

  // --- 1. spárování + soupeři ---------------------------------------------
  const items: Item[] = []
  for (const entry of entries) {
    const base = entry.vysledky ?? entry.rozpis!
    const weAreHome = isOurTeam(base.home.name)
    const opponentName = weAreHome ? base.away.name : base.home.name
    let existing = byMatchId.get(entry.matchId) ?? null
    let legacy = false
    if (!existing) {
      existing = pairLegacy(entry, legacyPool.filter((d) => !claimed.has(d.id)), opponents)
      if (existing) {
        claimed.add(existing.id)
        legacy = true
      }
    }
    const opponentId = await opponents.resolve(opponentName)
    items.push({ entry, weAreHome, opponentName, existing, legacy, opponentId, detail: null })
  }

  // --- 2. detail ------------------------------------------------------------
  if (ctx.settings.parts.matchDetail) {
    await span('vchl.matchDetail', async () => {
      for (const it of items) {
        const played = Boolean(it.entry.vysledky?.score)
        if (!played) continue
        const date = it.existing ? new Date(it.existing.date) : resolveMatchDate(it.entry, null, null)
        const recent = ctx.now.getTime() - date.getTime() <= RECENT_DAYS * DAY_MS
        if (it.existing?.ahl?.hasReport && !recent) continue
        const detail = await fetchMatchDetail(ctx, it.entry.matchId)
        if (!detail) continue
        const side = ourSide(detail)
        if (!side || (side === 'home') !== it.weAreHome) {
          ctx.warn({
            type: 'other',
            ref: String(it.entry.matchId),
            message: `Detail zápasu ${it.entry.matchId} nepatří týmu Čestice (${detail.home.name} – ${detail.away.name}), ignoruji.`,
          })
          continue
        }
        it.detail = detail
      }
    })
  }

  // --- 3. hráči (před zápisem branek a sestav, aby šly vyplnit vazby) -------
  if (ctx.settings.parts.matchDetail) {
    await span('vchl.players', async () => {
      for (const it of items) {
        if (!it.detail) continue
        await players.ensure(ourCandidates(it.detail, it.weAreHome ? 'home' : 'away'))
      }
    })
  }

  // --- 4. zápis zápasů ------------------------------------------------------
  const details = new Map<number, AhlMatchDetail>()
  const finalById = new Map<number, Match>(seasonDocs.map((d) => [d.id, d]))

  await span('vchl.matches', async () => {
    for (const it of items) {
      const { entry, existing, detail } = it
      const base = entry.vysledky ?? entry.rozpis!
      const side = it.weAreHome ? 'home' : 'away'
      const date = resolveMatchDate(entry, detail, existing)
      const score = entry.vysledky?.score ?? null

      // Soupeř: u spárovaného zápasu zůstává existující, pokud jde o tentýž
      // tým pod jiným jménem (duplicity v CMS) — jinak by se zápasy přepínaly
      // mezi „HC Skuteč" a „Skuteč".
      let opponent = it.opponentId
      const existingOpp = relId(existing?.opponent)
      if (existingOpp != null && existingOpp !== opponent) {
        const a = opponents.byId(existingOpp)
        if (a && keysIntersect(ahlNameKeys(it.opponentName), opponentKeys(a))) opponent = existingOpp
      }

      const desired: Record<string, unknown> = {
        date: date.toISOString(),
        competition: base.competition || undefined,
        opponent,
        home: it.weAreHome,
        venue: detail?.venue ?? base.venue ?? undefined,
      }
      if (lists.vysledky) {
        if (score) {
          desired.status = 'played'
          desired.scoreOurs = it.weAreHome ? score.home : score.away
          desired.scoreOpp = it.weAreHome ? score.away : score.home
          desired.overtime = score.suffix === 'pp'
          desired.shootout = score.suffix === 'sn'
        }
      }
      if (!score && lists.rozpis && entry.rozpis && existing?.status !== 'canceled') {
        desired.status = 'scheduled'
      }
      if (detail) {
        desired.thirds = buildThirds(detail, side)
        desired.goals = buildGoals(detail, side, players)
        desired.lineup = buildLineup(detail, side, players)
        details.set(entry.matchId, detail)
      }

      const hasReport = detail ? detail.hasReport : Boolean(existing?.ahl?.hasReport)
      const { patch, fields, before, after } = buildPatch(existing as unknown as Record<string, unknown>, desired)
      const ahlChanged =
        !existing || existing.ahl?.matchId !== entry.matchId || Boolean(existing.ahl?.hasReport) !== hasReport
      const label = `${utcToPragueLocal(date).day} ${it.weAreHome ? 'doma' : 'venku'} ${it.opponentName}`

      if (existing && fields.length === 0 && !ahlChanged) {
        continue
      }

      // Změna termínu u zápasu, který už byl s AHL spárovaný, je důvod
      // k upozornění (hráči a diváci se musí dozvědět nový čas).
      if (existing?.ahl?.matchId != null && fields.includes('date')) {
        ctx.warn({
          type: 'rescheduled',
          ref: String(entry.matchId),
          message: `Zápas s ${it.opponentName} přeložen: ${utcToPragueLocal(existing.date).day} ${
            utcToPragueLocal(existing.date).time
          } → ${utcToPragueLocal(date).day} ${utcToPragueLocal(date).time}.`,
        })
      }

      const ahl = {
        matchId: entry.matchId,
        hasReport,
        draftPostCreated: Boolean(existing?.ahl?.draftPostCreated),
        syncedAt: ctx.now.toISOString(),
      }

      let finalDoc: Match
      if (existing) {
        const full = { ...patch, ahl }
        // Hook `displayTitle` skládá titulek z `opponent` a `home`; bez nich
        // v datech by přepsal titulek zápasu na „soupeř x HC Čestice".
        if (fields.length > 0) Object.assign(full, { opponent, home: it.weAreHome })
        const changedFields = ahlChanged ? [...fields, 'ahl'] : fields
        ctx.recordDiff({
          entity: 'matches',
          key: `ahl:${entry.matchId}`,
          label: it.legacy ? `${label} (spárováno podle dne a soupeře)` : label,
          action: 'update',
          fields: changedFields,
          before: ahlChanged ? { ...before, ahl: existing.ahl ?? null } : before,
          after: ahlChanged ? { ...after, ahl: { matchId: ahl.matchId, hasReport } } : after,
        })
        await ctx.update('matches', existing.id, full)
        ctx.changes.matchesUpdated += 1
        finalDoc = { ...existing, ...full } as unknown as Match
        finalById.set(existing.id, finalDoc)
      } else {
        const data: Record<string, unknown> = {
          status: 'scheduled',
          ...Object.fromEntries(Object.entries(desired).filter(([, v]) => v !== undefined)),
          season: season.id,
          team: ctx.teamId,
          ahl,
        }
        ctx.recordDiff({
          entity: 'matches',
          key: `ahl:${entry.matchId}`,
          label,
          action: 'create',
          fields: Object.keys(data),
          after: data,
        })
        const created = await ctx.create('matches', data)
        ctx.changes.matchesCreated += 1
        finalDoc = { ...created, ...data } as unknown as Match
        // V nanečisto nemá nový zápas id; záporný klíč ho jen odliší od ostatních.
        finalById.set(Number.isNaN(created.id) ? -entry.matchId : created.id, finalDoc)
      }

      // Koncept reportáže: jen u zápasu, který se v tomto běhu poprvé
      // dostal do stavu „odehráno se zápisem" a je čerstvý. Bez limitu stáří
      // by backfill historie založil koncept ke každému zápasu minulé sezóny.
      const wasDone = existing?.status === 'played' && Boolean(existing.ahl?.hasReport)
      const fresh = ctx.now.getTime() - date.getTime() <= RECENT_DAYS * DAY_MS
      if (detail && detail.hasReport && finalDoc.status === 'played' && !wasDone && fresh && !ahl.draftPostCreated) {
        drafts.push({ doc: finalDoc, detail })
      }
    }

    // --- 5. zápasy, které z AHL zmizely (nemažou se) -------------------------
    if (lists.rozpis && lists.vysledky) {
      for (const d of seasonDocs) {
        const id = d.ahl?.matchId
        if (id != null && !allListedIds.has(id)) {
          ctx.warn({
            type: 'missing-on-ahl',
            ref: String(id),
            message: `Zápas ${id} (${utcToPragueLocal(d.date).day}) už na AHL není v rozpisu ani ve výsledcích. Nemazáno.`,
          })
        }
      }
    }
  })

  return { docs: [...finalById.values()], details }
}
