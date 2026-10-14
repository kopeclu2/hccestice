import type { Match } from '@/payload-types'

import type { Outcome } from '../types'

/**
 * Čisté popisky zápasu (název, skóre, výsledek, štítek soutěže) bez jediného
 * importu Payloadu za běhu. Dřív žily v `matches.ts`, který na vrcholu sahá
 * na `@payload-config` — a testy je tak nemohly importovat.
 */

/** Jméno soupeře z relace (zápasy mají depth ≥ 1). */
export const opponentName = (match: Match): string =>
  typeof match.opponent === 'object' && match.opponent ? match.opponent.name : 'Soupeř'

export const CLUB_NAME = 'HC Čestice'

/** „HC Čestice × Soupeř" v pořadí domácí × hosté. */
export const matchTitle = (match: Match): string =>
  match.home ? `${CLUB_NAME} × ${opponentName(match)}` : `${opponentName(match)} × ${CLUB_NAME}`

/** Skóre v pořadí domácí : hosté (zápas ukládá góly z našeho pohledu). */
export const matchScore = (match: Match): string => {
  const ours = match.scoreOurs ?? 0
  const theirs = match.scoreOpp ?? 0
  return match.home ? `${ours}:${theirs}` : `${theirs}:${ours}`
}

export const scoreSuffix = (match: Match): '' | 'sn' | 'pp' =>
  match.shootout ? 'sn' : match.overtime ? 'pp' : ''

/** Výsledek z pohledu Čestic (jen u odehraných zápasů). */
export const matchOutcome = (match: Match): Outcome => {
  const ours = match.scoreOurs ?? 0
  const theirs = match.scoreOpp ?? 0
  if (ours > theirs) return 'win'
  if (ours < theirs) return match.overtime || match.shootout ? 'otLoss' : 'loss'
  return 'draw'
}

const ROUND_PATTERN = /(\d+)\.\s*kolo/i
const PHASE_PATTERN =
  /(čtvrtfinále|semifinále|finále|o 3\. místo|play-?off|baráž|turnaj|přátel\w*)/i

/**
 * Krátký štítek soutěže do karet a výpisů — texty v CMS bývají dlouhé
 * („2. kolo OLLH play-off"), štítek má ale jen pár znaků na šířku.
 * Přednost má číslo kola, pak fáze soutěže; jinak zůstane text celý.
 */
export const phaseLabel = (match: Match): string => {
  const competition = (match.competition ?? '').replace(/^VČHL\s*(play-off\s*)?/i, '').trim()
  if (!competition) return 'VČHL'

  const round = competition.match(ROUND_PATTERN)
  if (round) return `${round[1]}. kolo`

  const phase = competition.match(PHASE_PATTERN)
  const label = phase ? phase[1] : competition
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Příjmení z „Jméno Příjmení" — tituly a „ml./st." (končí tečkou) se přeskočí. */
const surnameOf = (name: string): string => {
  const words = name.split(/\s+/).filter((word) => word && !word.endsWith('.'))
  return words[words.length - 1] ?? name
}

/**
 * Naši střelci do řádku výsledku: „Sajdl 2, Vacek, Kopecký".
 *
 * Řazení: víc branek první, při shodě pořadí první branky. Rozhodující
 * nájezd (`strength === 'SN'`) se nepočítá — do skóre se zapíše jako
 * jediná branka nájezdů, ale není to gól do statistik. Když se v zápase
 * sejdou dva střelci se stejným příjmením (Sajdlové), přidá se iniciála.
 * Bez zápisu (`goals` prázdné) vrací null a řádek se nevykreslí.
 */
export const scorersLabel = (match: Pick<Match, 'goals'>): string | null => {
  const tally = new Map<string, { name: string; count: number }>()
  for (const goal of match.goals ?? []) {
    if (goal.side !== 'ours' || goal.strength === 'SN') continue
    const player = typeof goal.scorer === 'object' && goal.scorer ? goal.scorer : null
    const name = goal.scorerName ?? player?.name
    if (!name) continue
    const key = typeof goal.scorer === 'number' ? `id:${goal.scorer}` : (player ? `id:${player.id}` : name)
    const entry = tally.get(key)
    if (entry) entry.count += 1
    else tally.set(key, { name, count: 1 })
  }
  if (tally.size === 0) return null

  const entries = [...tally.values()]
  const surnameCount = new Map<string, number>()
  for (const { name } of entries) {
    const surname = surnameOf(name)
    surnameCount.set(surname, (surnameCount.get(surname) ?? 0) + 1)
  }

  return entries
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map(({ name, count }) => {
      const surname = surnameOf(name)
      const label =
        (surnameCount.get(surname) ?? 0) > 1 ? `${name.trim().charAt(0)}. ${surname}` : surname
      return count > 1 ? `${label} ${count}` : label
    })
    .join(', ')
}
