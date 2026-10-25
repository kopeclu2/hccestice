import type { Training } from '@/payload-types'

import type { TrainingSession } from './trainingsTable'

/** Pole dokumentu `trainings`, která mapování čte (shodně se `select` ve fetcheru). */
export type TrainingDoc = Pick<
  Training,
  'id' | 'date' | 'endsAt' | 'group' | 'venue' | 'note' | 'joint'
>

/** Prázdný text z CMS (`''`, mezery) se chová jako nevyplněný. */
const text = (value: string | null | undefined): string | null => value?.trim() || null

/**
 * Dokument kolekce `trainings` → termín pro tabulku. Čistá funkce bez I/O.
 * Místo nechává prázdné — výchozí doplňuje blok (`TRAININGS.defaultVenue`),
 * aby se nemuselo měnit klíč cache, kdyby se výchozí místo změnilo.
 */
export function toTrainingSession(doc: TrainingDoc): TrainingSession {
  return {
    id: String(doc.id),
    startsAt: doc.date,
    endsAt: doc.endsAt ?? null,
    group: text(doc.group),
    venue: text(doc.venue),
    note: text(doc.note),
    accent: Boolean(doc.joint),
  }
}
