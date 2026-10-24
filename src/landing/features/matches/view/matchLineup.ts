import type { Match } from '@/payload-types'

import { goalName } from './matchEvents'

/** Řádek soupisky: hráč HC Čestice v jednom zápase. */
export type LineupRow = {
  number: number | null
  name: string
  goals: number
  assists: number
  /** Kanadské body (góly + asistence). */
  points: number
  /** Trestné minuty. */
  pim: number
}

/** Soupiska zápasu: hráči v poli a brankáři zvlášť. */
export type MatchLineup = {
  skaters: LineupRow[]
  goalies: LineupRow[]
}

const byNumberThenName = (a: LineupRow, b: LineupRow): number => {
  // Hráč bez čísla na konec.
  const diff = (a.number ?? Number.MAX_SAFE_INTEGER) - (b.number ?? Number.MAX_SAFE_INTEGER)
  return diff || a.name.localeCompare(b.name, 'cs')
}

/**
 * Sestava z dokumentu zápasu → soupiska pro web. Čistá funkce.
 *
 * - Řádek bez jména (ani v textu, ani v relaci) se zahodí: nešlo by ho
 *   ukázat a nic by neřekl.
 * - Řazení podle čísla dresu, pak jména (česká abeceda) — AHL u shody příjmení
 *   pořadí nedrží, takže bez řazení by se tabulka mezi synchronizacemi
 *   přeskládávala.
 * - Brankáři (`goalie`) jsou zvlášť, hráči v poli zvlášť.
 * - Prázdná nebo chybějící sestava dá `null` (blok se nevykreslí).
 */
export const buildLineup = (lineup: Match['lineup'] | undefined): MatchLineup | null => {
  const rows = (lineup ?? []).flatMap((row): { goalie: boolean; row: LineupRow }[] => {
    const name = goalName(row.name, row.player)
    if (!name) return []
    const goals = row.goals ?? 0
    const assists = row.assists ?? 0
    return [
      {
        goalie: Boolean(row.goalie),
        row: {
          number: row.number ?? null,
          name,
          goals,
          assists,
          points: goals + assists,
          pim: row.pim ?? 0,
        },
      },
    ]
  })
  if (rows.length === 0) return null
  return {
    skaters: rows
      .filter((item) => !item.goalie)
      .map((item) => item.row)
      .sort(byNumberThenName),
    goalies: rows
      .filter((item) => item.goalie)
      .map((item) => item.row)
      .sort(byNumberThenName),
  }
}
