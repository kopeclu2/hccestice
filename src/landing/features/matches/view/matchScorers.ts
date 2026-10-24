import type { ArticleGoal, MatchTimelinePeriod } from '@/landing/features/matches/types'

/** Naše branka pro blok Střelci. */
export type ScorerRow = {
  time: string
  /** Stav po brance v pořadí domácí : hosté. */
  score: string
  scorer: string
  assists: string[]
  special: ArticleGoal['special']
}

/**
 * Naše branky v pořadí, jak padly — z časové osy detailu, takže souhlasí
 * s tím, co ukazuje `/zapasy/[slug]`. Soupeřovy branky a tresty se
 * přeskakují (osa u soupeře jména nenese). Rozhodující nájezd (`SN`) zůstává:
 * v zápise je to branka a čtenář chce vědět, kdo rozhodl.
 */
export const buildScorers = (periods: readonly MatchTimelinePeriod[]): ScorerRow[] =>
  periods
    .flatMap((period) => period.events)
    .flatMap((event): ScorerRow[] =>
      event.type === 'goal' && event.ours
        ? [
            {
              time: event.time,
              score: event.score,
              scorer: event.scorer,
              assists: event.assists,
              special: event.special,
            },
          ]
        : [],
    )
