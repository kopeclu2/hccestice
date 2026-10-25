/** View-modely rozpisu tréninků (termíny: `view/trainingsTable.ts`). */

/** Texty sekce Tréninky — nadpis, štítek a perex z bloku. */
export type TrainingsContent = {
  kicker: string | null
  headline: string
  headlineHighlight: string
  headlineRest: string
  perex: string | null
}
