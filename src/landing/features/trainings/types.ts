/** View-modely rozpisu tréninků. */

/** Jedna ledová hodina v rozpisu tréninků (karta v pásu). */
export type TrainingSlot = {
  day: string
  time: string
  /** Štítek skupiny („Muži", „Muži + mládež"). Prázdné = bez štítku. */
  group: string | null
  /** Místo — z řádku, jinak výchozí místo sekce. */
  venue: string | null
  /** Doplňková poznámka pod místem („Od 1. 11.", „Bez brankáře"). */
  note: string | null
  /** Zvýrazněná (tmavá) karta s lime štítkem. */
  accent: boolean
}

export type TrainingsContent = {
  kicker: string | null
  headline: string
  headlineHighlight: string
  headlineRest: string
  perex: string | null
  rows: TrainingSlot[]
}
