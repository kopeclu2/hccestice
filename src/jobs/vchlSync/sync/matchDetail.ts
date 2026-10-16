import { AhlFetchError, AhlParseError, isOurTeam, parseMatchDetail, zapasUrl } from '@/ahl'
import type { AhlGoal, AhlLineupRow, AhlMatchDetail, AhlPair, AhlPersonRef } from '@/ahl'

import { span } from '../sentry'

import type { SyncContext } from './ctx'
import type { PlayerCandidate } from './players'

/**
 * Verze zpracování zápisu (`ahl.detailVersion`). Zvýšit, kdykoli se ze zápisu
 * začne brát nové pole: zápasy se zápisem s nižší verzí (`null` = 1) se pak
 * jednorázově stáhnou znovu (backfill), i když jsou starší než `RECENT_DAYS`.
 *
 * 1 = branky, sestavy, třetiny; 2 = + tresty a statistika zápasu.
 */
export const DETAIL_VERSION = 2

/**
 * Detail jen pro naše zápasy. Chyba jednoho detailu nesmí zastavit zbytek
 * běhu (zápis se může na AHL právě opravovat) — zápas se přeskočí a běh
 * skončí jako `partial`.
 */
export async function fetchMatchDetail(
  ctx: SyncContext,
  matchId: number,
): Promise<AhlMatchDetail | null> {
  try {
    return await span('vchl.fetch.zapas', async () =>
      parseMatchDetail(await ctx.client.get(zapasUrl(matchId)), matchId),
    )
  } catch (err) {
    if (!(err instanceof AhlFetchError || err instanceof AhlParseError)) throw err
    ctx.partialFailure(err, err instanceof AhlParseError ? 'parse' : 'fetch', {
      matchId,
      url: err instanceof AhlFetchError ? err.url : zapasUrl(matchId),
    })
    return null
  }
}

/** Kterou stranou zápasu jsou Čestice; `null` = detail nepatří našemu zápasu. */
export function ourSide(detail: AhlMatchDetail): 'home' | 'away' | null {
  if (isOurTeam(detail.home.name)) return 'home'
  if (isOurTeam(detail.away.name)) return 'away'
  return null
}

type Resolve = { idFor(ahlPlayerId: number | null, name: string): number | null }

const refCandidate = (p: AhlPersonRef): PlayerCandidate => ({
  ahlPlayerId: p.playerId,
  name: p.name,
  number: null,
  goalie: false,
})

const lineupCandidate = (r: AhlLineupRow): PlayerCandidate => ({
  ahlPlayerId: r.playerId,
  name: r.name,
  number: r.number,
  goalie: r.goalie,
})

/** Hráči našeho týmu ze sestavy a z našich branek (střelci i asistenti). */
export function ourCandidates(detail: AhlMatchDetail, side: 'home' | 'away'): PlayerCandidate[] {
  const out: PlayerCandidate[] = detail.lineups[side].map(lineupCandidate)
  for (const g of detail.goals) {
    if (g.side !== side) continue
    out.push(refCandidate(g.scorer), ...g.assists.map(refCandidate))
  }
  // Jen hráči s `hracid`, kteří nejsou v sestavě: trest trenéra nebo lavice
  // bez odkazu na hráče by jinak založil falešného neaktivního hráče.
  const inLineup = new Set(detail.lineups[side].map((r) => r.playerId))
  for (const p of detail.penalties ?? []) {
    const id = p.player?.playerId
    if (p.side === side && p.player && id != null && !inLineup.has(id))
      out.push(refCandidate(p.player))
  }
  return out
}

/** Jen třetiny; čtvrtá položka u AHL je prodloužení a to nese `overtime`. */
export function buildThirds(detail: AhlMatchDetail, side: 'home' | 'away') {
  const opp = side === 'home' ? 'away' : 'home'
  return detail.periods.slice(0, 3).map((p) => ({ ours: p[side], opp: p[opp] }))
}

function flipScore(state: string, side: 'home' | 'away'): string {
  if (side === 'home') return state
  const [h, a] = state.split(':')
  return `${a}:${h}`
}

/**
 * Branky našeho zápasu. `scoreAfter` je ve tvaru NAŠE:SOUPEŘ (ne domácí:hosté
 * jako na AHL), stejně jako `scoreOurs`/`scoreOpp` — čtenář nemusí hádat, kdo
 * byl doma.
 *
 * Rozhodující nájezd AHL zapisuje jako branku v 60:00 a započítává ji střelci
 * do G. Ponecháváme ji (součty musí sedět s AHL), ale `strength` je `SN`, aby
 * ji frontend dokázal odlišit od branky ze hry.
 */
export function buildGoals(detail: AhlMatchDetail, side: 'home' | 'away', players: Resolve) {
  const shootout = detail.score?.suffix === 'sn'
  return detail.goals.map((g: AhlGoal) => {
    const ours = g.side === side
    const idOf = (p: AhlPersonRef | undefined) =>
      ours && p ? players.idFor(p.playerId, p.name) : null
    const [a1, a2] = g.assists
    return {
      time: g.time,
      side: ours ? 'ours' : 'opp',
      strength: shootout && g.time === '60:00' ? 'SN' : g.strength,
      scoreAfter: flipScore(g.scoreAfter, side),
      scorer: idOf(g.scorer),
      scorerName: g.scorer.name,
      assist1: idOf(a1),
      assist1Name: a1?.name ?? null,
      assist2: idOf(a2),
      assist2Name: a2?.name ?? null,
    }
  })
}

/**
 * Kanonické pořadí řádků. AHL řadí podle příjmení a u shody (dva Javůrkové,
 * dva Vašatové) pořadí nedrží stabilně, takže stejná data přicházejí jednou
 * v jednom a podruhé v jiném pořadí. `normalize` v `diff.ts` pořadí řádků
 * pole zachovává, takže by diff hlásil falešnou změnu a zbytečný zápis.
 */
const byNumberLast = (a: number | null, b: number | null) =>
  a === b ? 0 : a === null ? 1 : b === null ? -1 : a - b
const byName = (a: string | null, b: string | null) => (a ?? '').localeCompare(b ?? '', 'cs')

/** `m:ss` / `mm:ss` → vteřiny (číselně, ne stringově: `9:59` < `10:00`); nečitelné na konec. */
const toSeconds = (time: string): number => {
  const m = /^(\d+):(\d{1,2})$/.exec(time.trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.POSITIVE_INFINITY
}

export function buildLineup(detail: AhlMatchDetail, side: 'home' | 'away', players: Resolve) {
  const rows = detail.lineups[side].map((r) => ({
    player: players.idFor(r.playerId, r.name),
    name: r.name,
    number: r.number,
    goalie: r.goalie,
    goals: r.goals,
    assists: r.assists,
    pim: r.pim,
  }))
  return rows.sort(
    (a, b) =>
      byNumberLast(a.number, b.number) ||
      byName(a.name, b.name) ||
      byNumberLast(a.player, b.player),
  )
}

/**
 * Tresty hráčů Čestic. Tresty soupeře se záměrně neukládají (rozhodnutí
 * správce): nikde se nezobrazují a nemají koho odkazovat. Jejich počet a
 * minuty nese `buildMatchStats`.
 */
export function buildPenalties(detail: AhlMatchDetail, side: 'home' | 'away', players: Resolve) {
  // `null` = tabulka byla nečitelná; volající tresty vůbec nezapisuje.
  const rows = (detail.penalties ?? [])
    .filter((p) => p.side === side)
    .map((p) => ({
      time: p.time,
      minutes: p.minutes,
      kind: p.kind,
      reason: p.reason,
      player: p.player ? players.idFor(p.player.playerId, p.player.name) : null,
      playerName: p.player?.name ?? p.playerText ?? null,
    }))
  // Kanonické pořadí (viz `byNumberLast`): čas numericky, pak jméno a zbytek.
  return rows.sort(
    (a, b) =>
      toSeconds(a.time) - toSeconds(b.time) ||
      byName(a.playerName, b.playerName) ||
      byNumberLast(a.minutes, b.minutes) ||
      byName(a.kind, b.kind) ||
      byName(a.reason, b.reason),
  )
}

/** Statistika zápasu otočená z domácí:hosté na NAŠE:SOUPEŘ; chybějící řádek = null. */
export function buildMatchStats(detail: AhlMatchDetail, side: 'home' | 'away') {
  const opp = side === 'home' ? 'away' : 'home'
  const pair = (p: AhlPair | null) => ({ ours: p?.[side] ?? null, opp: p?.[opp] ?? null })
  const penalties = pair(detail.stats.penalties)
  const majors = pair(detail.stats.majors)
  const ppGoals = pair(detail.stats.ppGoals)
  return {
    penaltiesOurs: penalties.ours,
    penaltiesOpp: penalties.opp,
    majorsOurs: majors.ours,
    majorsOpp: majors.opp,
    ppGoalsOurs: ppGoals.ours,
    ppGoalsOpp: ppGoals.opp,
    ppTimeOurs: detail.stats.ppTime?.[side] ?? null,
    ppTimeOpp: detail.stats.ppTime?.[opp] ?? null,
  }
}

/**
 * Kontrola konzistence zápisu: součet minut našich trestů musí sedět se
 * součtem `TM` v naší sestavě. Rozdíl = AHL má nepřesný zápis (nebo jsme
 * špatně přečetli trest). Vrací `null`, když sedí.
 */
export function penaltyMinutesMismatch(
  detail: AhlMatchDetail,
  side: 'home' | 'away',
): { penalties: number; pim: number } | null {
  if (!detail.penalties) return null
  const penalties = detail.penalties
    .filter((p) => p.side === side)
    .reduce((sum, p) => sum + (p.minutes ?? 0), 0)
  const pim = detail.lineups[side].reduce((sum, r) => sum + r.pim, 0)
  return penalties === pim ? null : { penalties, pim }
}
