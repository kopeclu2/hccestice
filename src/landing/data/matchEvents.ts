import type { Match } from '@/payload-types'

import type { ArticleGoal, ArticleScoreboard } from '../types'

import { formatLongDate } from './format'
import { formatCompetition } from './matchFormat'

/**
 * Mapování událostí zápasu (branky, výsledková tabule) z kolekce `matches`
 * do view-modelů. Sdílí ho hero reportáže (`posts.ts`) a detail zápasu
 * (`matchDetail.ts`) — dřív to žilo jen v `posts.ts` a druhé místo by si
 * pravidla (prohození skóre u venkovních zápasů, rozpoznání přesilovky)
 * muselo opsat a časem by se rozešla.
 *
 * Čisté funkce: žádný Payload za běhu, jen typy.
 */

/** Jméno hráče z branky: text ze zápisu, jinak jméno z populované relace. */
export const goalName = (name: string | null | undefined, rel: unknown): string | null => {
  if (name) return name
  return typeof rel === 'object' && rel && 'name' in rel
    ? String((rel as { name: unknown }).name)
    : null
}

/**
 * Přesilovka / oslabení z `strength` („5/4" = tým, který skóroval, měl
 * na ledě 5 hráčů proti 4). Počítá jen běžné stavy do pěti hráčů —
 * 6/5 je vyhozený brankář, ne přesilovka. Nájezd je `SN`.
 */
export const goalSpecial = (strength: string | null | undefined): ArticleGoal['special'] => {
  if (strength === 'SN') return 'sn'
  const parts = strength?.match(/^(\d)\/(\d)$/)
  if (!parts) return null
  const [scoring, other] = [Number(parts[1]), Number(parts[2])]
  if (scoring > 5 || other > 5 || scoring === other) return null
  return scoring > other ? 'pp' : 'os'
}

/**
 * Průběh branek pro timeline v hero. `scoreAfter` je uložené z pohledu
 * Čestic (NAŠE:SOUPEŘ), tabule se ale čte domácí : hosté, takže se u
 * venkovních zápasů prohazuje.
 */
export const toGoals = (match: Match, weAreHome: boolean): ArticleGoal[] =>
  (match.goals ?? []).flatMap((goal): ArticleGoal[] => {
    const scorer = goalName(goal.scorerName, goal.scorer)
    if (!goal.time || !scorer) return []
    const [ours, theirs] = (goal.scoreAfter ?? '').split(':')
    return [
      {
        time: goal.time,
        ours: goal.side === 'ours',
        scorer,
        assists: [
          goalName(goal.assist1Name, goal.assist1),
          goalName(goal.assist2Name, goal.assist2),
        ].filter((name): name is string => Boolean(name)),
        score: ours && theirs ? (weAreHome ? `${ours}:${theirs}` : `${theirs}:${ours}`) : '',
        special: goalSpecial(goal.strength),
      },
    ]
  })

/** Výsledková tabule z odehraného zápasu; null = nelze sestavit. */
export const toScoreboard = (match: Match): ArticleScoreboard | null => {
  if (match.status !== 'played' || match.scoreOurs == null || match.scoreOpp == null) return null
  const opponent =
    typeof match.opponent === 'object' && match.opponent ? match.opponent.name : 'Soupeř'
  const weAreHome = Boolean(match.home)
  return {
    kicker: ['Zápasové zpravodajství', formatCompetition(match.competition)]
      .filter(Boolean)
      .join(' · '),
    metaLine: [match.venue, formatLongDate(match.date)].filter(Boolean).join(' · '),
    homeName: weAreHome ? 'HC Čestice' : opponent,
    awayName: weAreHome ? opponent : 'HC Čestice',
    homeScore: weAreHome ? match.scoreOurs : match.scoreOpp,
    awayScore: weAreHome ? match.scoreOpp : match.scoreOurs,
    weAreHome,
    weWon: match.scoreOurs > match.scoreOpp,
    thirds: (match.thirds ?? []).map((third) =>
      weAreHome ? `${third.ours}:${third.opp}` : `${third.opp}:${third.ours}`,
    ),
    suffix: match.shootout ? 'sn' : match.overtime ? 'pp' : '',
    goals: toGoals(match, weAreHome),
  }
}
