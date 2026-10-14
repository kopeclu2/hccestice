import { AhlFetchError, AhlParseError, isOurTeam, parseMatchDetail, zapasUrl } from '@/ahl'
import type { AhlGoal, AhlLineupRow, AhlMatchDetail, AhlPersonRef } from '@/ahl'

import { span } from '../sentry'
import type { SyncContext } from './ctx'
import type { PlayerCandidate } from './players'

/**
 * Detail jen pro naše zápasy. Chyba jednoho detailu nesmí zastavit zbytek
 * běhu (zápis se může na AHL právě opravovat) — zápas se přeskočí a běh
 * skončí jako `partial`.
 */
export async function fetchMatchDetail(ctx: SyncContext, matchId: number): Promise<AhlMatchDetail | null> {
  try {
    return await span('vchl.fetch.zapas', async () => parseMatchDetail(await ctx.client.get(zapasUrl(matchId)), matchId))
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
    const idOf = (p: AhlPersonRef | undefined) => (ours && p ? players.idFor(p.playerId, p.name) : null)
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

export function buildLineup(detail: AhlMatchDetail, side: 'home' | 'away', players: Resolve) {
  return detail.lineups[side].map((r) => ({
    player: players.idFor(r.playerId, r.name),
    name: r.name,
    number: r.number,
    goalie: r.goalie,
    goals: r.goals,
    assists: r.assists,
    pim: r.pim,
  }))
}
