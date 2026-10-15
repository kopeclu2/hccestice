/**
 * České datumy a časy (Europe/Prague) — jediné místo, které zakládá
 * `Intl.DateTimeFormat`.
 *
 * Zakládat formatter je řádově dražší než jím formátovat (načítá locale data),
 * a dřív se to dělalo při každém volání (`weekday`, `dayMonth` v hlavičkách
 * zápasu) nebo ručně jako modulová konstanta v každém souboru. `dtf` je
 * memoizovaný podle voleb.
 *
 * Bez serverových importů — používá to klient (admin) i server.
 */

export const TZ = 'Europe/Prague'
export const LOCALE = 'cs-CZ'

/** Vstup formatterů: ISO řetězec z CMS, `Date` nebo epoch v ms. */
export type DateInput = Date | string | number

const cache = new Map<string, Intl.DateTimeFormat>()

/**
 * Memoizovaný `Intl.DateTimeFormat`. `timeZone` se doplní na `Europe/Prague`,
 * pokud ho volající nezadá; `locale` je `cs-CZ`.
 *
 * Klíč je stabilní vůči pořadí voleb (`{a, b}` = `{b, a}`).
 */
export function dtf(
  options: Intl.DateTimeFormatOptions,
  locale: string = LOCALE,
): Intl.DateTimeFormat {
  const full = { timeZone: TZ, ...options }
  const key = `${locale}|${JSON.stringify(Object.entries(full).sort(([a], [b]) => (a < b ? -1 : 1)))}`
  let format = cache.get(key)
  if (!format) {
    format = new Intl.DateTimeFormat(locale, full)
    cache.set(key, format)
  }
  return format
}

/**
 * `Date` z libovolného vstupu, `null` když je neplatný. Formattery z `Intl`
 * na neplatném datu hází `RangeError`; `toLocaleDateString` (které tu dřív
 * bylo) vracelo řetězec „Invalid Date" a stránka nespadla.
 */
export const toDate = (input: DateInput): Date | null => {
  const date = input instanceof Date ? input : new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Naformátuje datum podle voleb; neplatné datum dá `''` (nikdy nehází). */
export function formatDate(input: DateInput, options: Intl.DateTimeFormatOptions): string {
  const date = toDate(input)
  return date ? dtf(options).format(date) : ''
}

/** „8. 3." */
export const formatDay = (input: DateInput): string =>
  formatDate(input, { day: 'numeric', month: 'numeric' })

/** „8. března 17:00" */
export const formatDateTime = (input: DateInput): string =>
  formatDate(input, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

/** „so" — zkratka dne v týdnu. */
export const formatWeekday = (input: DateInput): string => formatDate(input, { weekday: 'short' })

/** „so 8. 3." */
export const formatWeekdayDay = (input: DateInput): string =>
  formatDate(input, { weekday: 'short', day: 'numeric', month: 'numeric' })

/** „17:00" */
export const formatTime = (input: DateInput): string =>
  formatDate(input, { hour: '2-digit', minute: '2-digit' })

/** „8. 3. 2026" */
export const formatFullDate = (input: DateInput): string =>
  formatDate(input, { day: 'numeric', month: 'numeric', year: 'numeric' })

/** „8. března 2026" */
export const formatLongDate = (input: DateInput): string =>
  formatDate(input, { day: 'numeric', month: 'long', year: 'numeric' })

/** „8. 3. 2026 17:00" — číselné datum s časem (admin, historie běhů). */
export const formatFullDateTime = (input: DateInput): string =>
  formatDate(input, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** „sobota" — celý název dne v týdnu; `null` pro neplatné datum. */
export const weekdayLong = (input: DateInput): string | null => {
  const date = toDate(input)
  return date ? dtf({ weekday: 'long' }).format(date) : null
}

/** Den a měsíc číslem („13", „12") pro velké číslicové kompozice; `null` pro neplatné datum. */
export const dayMonthParts = (input: DateInput): { day: string; month: string } | null => {
  const date = toDate(input)
  if (!date) return null
  const parts = dtf({ day: 'numeric', month: 'numeric' }).formatToParts(date)
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return day && month ? { day, month } : null
}

/* ── Převody lokálního času Europe/Prague ↔ UTC ──────────────────────────── */

const partsFormat = () =>
  dtf(
    {
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
    'en-CA',
  )

function partsOf(ms: number) {
  const p = Object.fromEntries(
    partsFormat()
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  )
  return {
    y: +p.year,
    mo: +p.month,
    d: +p.day,
    h: +p.hour,
    mi: +p.minute,
    s: +p.second,
  }
}

/** Posun Europe/Prague proti UTC v ms (7 200 000 v létě, 3 600 000 v zimě). */
function offsetMs(utcMs: number): number {
  const p = partsOf(utcMs)
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(utcMs / 1000) * 1000
}

/**
 * Lokální čas z ahl.cz (`YYYY-MM-DDTHH:mm:ss`, bez zóny) → UTC `Date`.
 *
 * Nestačí `new Date(local)`: ten bere zónu stroje, takže na Docker kontejneru
 * v UTC by se každý zápas posunul o 1–2 hodiny. Offset se proto zjišťuje
 * z `Intl` a po prvním odhadu se ověří znovu — kolem přechodu na letní čas
 * (poslední neděle března / října) se offset liší mezi odhadem a výsledkem.
 * Neexistující hodina (jarní skok 2:00 → 3:00) a opakovaná (podzimní) se
 * vyřeší deterministicky; zápasy se v noci nehrají.
 */
export function pragueLocalToUtc(local: string): Date {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!m) throw new Error(`Neplatné lokální datum „${local}"`)
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0))
  const off1 = offsetMs(asUtc)
  let utc = asUtc - off1
  const off2 = offsetMs(utc)
  if (off2 !== off1) utc = asUtc - off2
  return new Date(utc)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** UTC okamžik → lokální den (`YYYY-MM-DD`) a čas (`HH:mm`) v Europe/Prague. */
export function utcToPragueLocal(date: Date | string): { day: string; time: string } {
  const p = partsOf(new Date(date).getTime())
  return { day: `${p.y}-${pad(p.mo)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.mi)}` }
}
