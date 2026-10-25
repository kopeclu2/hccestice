import { fold } from '@/lib/fold'

/**
 * Import rozpisu tréninků z textu — jeden termín na řádek:
 *
 *   úterý    03.11.2026    16:00-17:15    trénink Muži + děti
 *
 * Sloupce odděluje tabulátor nebo víc mezer, takže jde vložit tabulka
 * zkopírovaná z webu. Den v týdnu se nečte jako data (počítá se z data), jen
 * hlídá překlep: „pátek 03.11.2026" je chyba, protože 3. 11. 2026 je úterý.
 *
 * Bez serverových importů — používá to seed skript i testy.
 */

export type ParsedTraining = {
  /** Lokální čas Europe/Prague bez zóny (`2026-11-03T16:00`), pro `pragueLocalToUtc`. */
  start: string
  /** Totéž pro konec; `null` = čas bez konce. */
  end: string | null
  group: string | null
  note: string | null
}

export type ParseResult =
  { ok: true; training: ParsedTraining; warning: string | null } | { ok: false; error: string }

/** Dny v týdnu podle `Date.getUTCDay()` (0 = neděle), bez diakritiky. */
const WEEKDAYS = ['nedele', 'pondeli', 'utery', 'streda', 'ctvrtek', 'patek', 'sobota']
/** Totéž s diakritikou, pro text varování. */
const WEEKDAY_NAMES = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota']
const SHORT_WEEKDAYS = ['ne', 'po', 'ut', 'st', 'ct', 'pa', 'so']

const LINE =
  /^(?:(\S+)\s+)?(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\s+(\d{1,2}:\d{2})(?:\s*[-–—]\s*(\d{1,2}:\d{2}))?(?:\s+(.*))?$/

const pad = (n: number): string => String(n).padStart(2, '0')

function normalizeTime(value: string): string | null {
  const [h, m] = value.split(':').map(Number)
  return h <= 23 && m <= 59 ? `${pad(h)}:${pad(m)}` : null
}

/** „trénink Muži + děti" → skupina „Muži + děti"; samotné „trénink" = bez skupiny. */
function splitDescription(raw: string | undefined): { group: string | null; note: string | null } {
  const text = (raw ?? '').replace(/\s+/g, ' ').trim()
  // Poznámka za středníkem: „Muži; bez brankáře".
  const [head, ...rest] = text.split(';')
  const group = head
    .replace(/^tr[ée]nink\b[\s:,-]*/i, '')
    .trim()
    .replace(/^./, (c) => c.toLocaleUpperCase('cs-CZ'))
  const note = rest.join(';').trim()
  return { group: group || null, note: note || null }
}

export function parseTrainingLine(line: string): ParseResult {
  const m = line.trim().match(LINE)
  if (!m) return { ok: false, error: 'neznámý formát (čekám „den DD.MM.RRRR HH:MM-HH:MM popis")' }

  const [, weekday, d, mo, y, from, to, description] = m
  const day = +d
  const month = +mo
  const year = +y

  const calendar = new Date(Date.UTC(year, month - 1, day))
  if (
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  ) {
    return { ok: false, error: `neexistující datum ${d}.${mo}.${y}` }
  }

  const start = normalizeTime(from)
  const end = to ? normalizeTime(to) : null
  if (!start || (to && !end))
    return { ok: false, error: `neplatný čas „${to ? `${from}-${to}` : from}"` }
  if (end && end <= start) return { ok: false, error: `konec ${end} není po začátku ${start}` }

  let warning: string | null = null
  if (weekday) {
    const expected = calendar.getUTCDay()
    const given = fold(weekday).replace(/\.$/, '')
    const matches = given === WEEKDAYS[expected] || given === SHORT_WEEKDAYS[expected]
    if (!matches) warning = `„${weekday}", ale ${d}.${mo}.${y} je ${WEEKDAY_NAMES[expected]}`
  }

  const date = `${year}-${pad(month)}-${pad(day)}`
  return {
    ok: true,
    warning,
    training: {
      start: `${date}T${start}`,
      end: end ? `${date}T${end}` : null,
      ...splitDescription(description),
    },
  }
}
