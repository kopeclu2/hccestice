import { parsePlayerStats, statistikyUrl } from '@/ahl'
import type { AhlMatchDetail } from '@/ahl'
import type { Match } from '@/payload-types'

import type { SeasonCtx } from '../context'
import { span } from '../sentry'
import type { SyncContext } from './ctx'
import { ourSide } from './matchDetail'
import type { PlayerResolver } from './players'

type Sum = { name: string; games: number; goals: number; assists: number; pim: number }

/**
 * Kontrolní součet: souhrn hráčů ze stránky Statistiky AHL proti součtu
 * ze sestav všech zápasů sezóny, které máme. Rozdíl znamená chybějící
 * zápis, nespárovaného hráče nebo opravu zápisu — jen upozornění, nic se
 * podle něj nepřepisuje.
 */
export async function checkStats(
  ctx: SyncContext,
  season: SeasonCtx,
  docs: Match[],
  details: Map<number, AhlMatchDetail>,
  players: PlayerResolver,
): Promise<void> {
  await span('vchl.statsCheck', async () => {
    const stats = parsePlayerStats(
      await ctx.client.get(statistikyUrl(season.competitionYearId, season.participantId)),
    )

    const sums = new Map<number, Sum>()
    const add = (id: number | null, name: string, r: { goals: number; assists: number; pim: number }) => {
      if (id == null) return
      const s = sums.get(id) ?? { name, games: 0, goals: 0, assists: 0, pim: 0 }
      s.games += 1
      s.goals += r.goals
      s.assists += r.assists
      s.pim += r.pim
      sums.set(id, s)
    }

    for (const doc of docs) {
      const matchId = doc.ahl?.matchId
      if (matchId == null) continue
      const detail = details.get(matchId)
      if (detail) {
        // Čerstvě stažený detail je přesnější než DB (v nanečisto v ní není).
        const side = ourSide(detail)
        if (!side) continue
        for (const r of detail.lineups[side]) add(r.playerId, r.name, r)
      } else {
        for (const r of doc.lineup ?? []) {
          const rel = typeof r.player === 'object' && r.player ? r.player.id : (r.player as number | null | undefined)
          add(rel != null ? players.ahlIdOf(rel) : null, r.name ?? '', {
            goals: r.goals ?? 0,
            assists: r.assists ?? 0,
            pim: r.pim ?? 0,
          })
        }
      }
    }
    if (sums.size === 0) return

    const seen = new Set<number>()
    for (const st of stats) {
      if (st.playerId == null) continue
      seen.add(st.playerId)
      const s = sums.get(st.playerId) ?? { name: st.name, games: 0, goals: 0, assists: 0, pim: 0 }
      if (s.games !== st.games || s.goals !== st.goals || s.assists !== st.assists || s.pim !== st.pim) {
        ctx.warn({
          type: 'stats-mismatch',
          ref: String(st.playerId),
          message: `${st.name}: AHL Z/G/A/TM ${st.games}/${st.goals}/${st.assists}/${st.pim}, ze zápisů ${s.games}/${s.goals}/${s.assists}/${s.pim}.`,
        })
      }
    }
    for (const [id, s] of sums) {
      if (!seen.has(id) && (s.goals || s.assists || s.pim)) {
        ctx.warn({
          type: 'stats-mismatch',
          ref: String(id),
          message: `${s.name} je v zápisech (${s.games} zápasů), ale ve statistikách AHL chybí.`,
        })
      }
    }
  })
}
