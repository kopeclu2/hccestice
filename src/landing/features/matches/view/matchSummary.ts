import type { MatchTimelinePeriod } from '@/landing/features/matches/types'

/** Kanadské body hráče HC Čestice v jednom zápase. */
export type PlayerPoints = { name: string; goals: number; assists: number; points: number }

/** Tresty hráče HC Čestice v jednom zápase; `minutes` bez trestů s neznámou délkou. */
export type PlayerPenalties = { name: string; minutes: number; count: number }

export type MatchSummary = {
  points: PlayerPoints[]
  penalties: PlayerPenalties[]
  penaltyMinutes: number
  /** Naše góly v přesilovce / v oslabení. */
  ppGoals: number
  shGoals: number
}

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name.localeCompare(b.name, 'cs')

/**
 * Souhrn zápasu za HC Čestice, spočítaný z časové osy při vykreslení —
 * do cache detailu nic nového nejde, takže klíč `match-detail` zůstává.
 *
 * Rozhodující nájezd (`special: 'sn'`) se do kanadských bodů **nepočítá**:
 * podle hokejových pravidel nájezd není branka hráče, i když ho AHL v zápisu
 * vede jako gól v 60:00 (viz AGENTS.md → Zvláštnosti HTML na ahl.cz).
 *
 * Řazení: body, pak góly, pak jméno (česká abeceda); tresty podle minut.
 */
export const buildMatchSummary = (periods: MatchTimelinePeriod[]): MatchSummary => {
  const points = new Map<string, PlayerPoints>()
  const penalties = new Map<string, PlayerPenalties>()
  let penaltyMinutes = 0
  let ppGoals = 0
  let shGoals = 0

  const player = (name: string): PlayerPoints => {
    const found = points.get(name)
    if (found) return found
    const created = { name, goals: 0, assists: 0, points: 0 }
    points.set(name, created)
    return created
  }

  for (const event of periods.flatMap((period) => period.events)) {
    if (event.type === 'penalty') {
      const minutes = event.minutes ?? 0
      const row = penalties.get(event.player) ?? { name: event.player, minutes: 0, count: 0 }
      row.minutes += minutes
      row.count += 1
      penalties.set(event.player, row)
      penaltyMinutes += minutes
      continue
    }
    if (!event.ours || event.special === 'sn') continue
    if (event.special === 'pp') ppGoals += 1
    if (event.special === 'os') shGoals += 1
    if (event.scorer) {
      const scorer = player(event.scorer)
      scorer.goals += 1
      scorer.points += 1
    }
    for (const name of event.assists) {
      if (!name) continue
      const assistant = player(name)
      assistant.assists += 1
      assistant.points += 1
    }
  }

  return {
    points: [...points.values()].sort(
      (a, b) => b.points - a.points || b.goals - a.goals || byName(a, b),
    ),
    penalties: [...penalties.values()].sort((a, b) => b.minutes - a.minutes || byName(a, b)),
    penaltyMinutes,
    ppGoals,
    shGoals,
  }
}
