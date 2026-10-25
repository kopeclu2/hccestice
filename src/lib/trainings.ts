import { formatFullDate, formatWeekday, pragueLocalToUtc, utcToPragueLocal } from '@/lib/datetime'

/**
 * Začátek sezóny je 1. srpna: srpen až prosinec patří sezóně, která začala
 * v témže roce, leden až červenec té z roku předchozího. Měsíc a rok se berou
 * v Europe/Prague, takže 1. 8. v 0:30 pražského času (30. 7. 22:30 UTC)
 * patří už nové sezóně.
 *
 * `null` pro neplatné datum.
 */
export function seasonStartYear(date: Date | string | number): number | null {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  const [year, month] = utcToPragueLocal(parsed).day.split('-').map(Number)
  return month >= 8 ? year : year - 1
}

/** Titulek termínu tréninku pro admin: „út 3. 11. 2026 · Muži + děti" (bez skupiny jen datum). */
export function trainingTitle(
  date: Date | string | number | null | undefined,
  group: string | null | undefined,
): string {
  if (date == null || date === '') return ''
  const day = formatFullDate(date)
  if (!day) return ''
  const head = `${formatWeekday(date)} ${day}`
  const name = group?.trim()
  return name ? `${head} · ${name}` : head
}

/** Začátek dne (Europe/Prague) jako ISO v UTC — hranice „od dneška" pro výpis tréninků. */
export function startOfPragueDayIso(now: Date): string {
  const { day } = utcToPragueLocal(now)
  return pragueLocalToUtc(`${day}T00:00`).toISOString()
}
