import { formatDate, formatDay, formatTime, formatWeekday, utcToPragueLocal } from '@/lib/datetime'

/** Jeden termín tréninku — vstup tabulky (později dokument kolekce `trainings`). */
export type TrainingSession = {
  id: string
  /** ISO začátku. */
  startsAt: string
  /** ISO konce; prázdné = čas bez konce. */
  endsAt: string | null
  group: string | null
  venue: string | null
  note: string | null
  /** Zvýrazněný termín (společný trénink, turnaj…). */
  accent: boolean
}

export type TrainingRowView = {
  id: string
  /** „út" — počítá se z data, neukládá se. */
  weekday: string
  /** „3. 11." */
  date: string
  /** „16:00–17:15" nebo „16:00". */
  time: string
  dateTime: string
  group: string | null
  venue: string | null
  note: string | null
  accent: boolean
}

export type TrainingMonthView = {
  /** „2026-11" — klíč a `key` v Reactu. */
  key: string
  /** „listopad 2026" */
  label: string
  rows: TrainingRowView[]
}

/** 2026-11 v Europe/Prague (cs-CZ formát by dal 11/2026). */
const monthKey = (iso: string): string => utcToPragueLocal(iso).day.slice(0, 7)

/**
 * Termíny → měsíce s řádky. Řadí podle začátku (stabilně), takže pořadí
 * zadání v adminu nehraje roli. Neplatné datum se zahodí, ať jeden špatný
 * záznam nerozbije celou tabulku.
 */
export function buildTrainingMonths(sessions: TrainingSession[]): TrainingMonthView[] {
  const sorted = sessions
    .filter((session) => formatTime(session.startsAt) !== '')
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))

  const months = new Map<string, TrainingMonthView>()
  for (const session of sorted) {
    const key = monthKey(session.startsAt)
    let month = months.get(key)
    if (!month) {
      month = {
        key,
        label: formatDate(session.startsAt, { month: 'long', year: 'numeric' }),
        rows: [],
      }
      months.set(key, month)
    }

    const from = formatTime(session.startsAt)
    const to = session.endsAt ? formatTime(session.endsAt) : ''

    month.rows.push({
      id: session.id,
      weekday: formatWeekday(session.startsAt),
      date: formatDay(session.startsAt),
      time: to ? `${from}–${to}` : from,
      dateTime: session.startsAt,
      group: session.group,
      venue: session.venue,
      note: session.note,
      accent: session.accent,
    })
  }

  return [...months.values()]
}
