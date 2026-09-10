import type { TrainingSlot } from '../../types'

/**
 * `day` a `time` jsou v CMS volný text („Út", „17:45 – 19:00") kvůli
 * jednoduchosti zadávání pro správce, ne strukturovaná pole — schema.org ale
 * pro `OpeningHoursSpecification` chce `dayOfWeek`/`opens`/`closes`. Řádek,
 * který se nepodaří rozpoznat (neznámá zkratka dne, jiný formát času), se
 * ze strukturovaných dat prostě vynechá — necháváme radši menší pokrytí než
 * riziko, že se pod špatně rozpoznaný den/čas propíše nesprávný fakt.
 */
const DAY_MAP: Record<string, string> = {
  po: 'https://schema.org/Monday',
  út: 'https://schema.org/Tuesday',
  st: 'https://schema.org/Wednesday',
  čt: 'https://schema.org/Thursday',
  pá: 'https://schema.org/Friday',
  so: 'https://schema.org/Saturday',
  ne: 'https://schema.org/Sunday',
}

const TIME_RANGE = /(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/

const normalizeDay = (day: string): string | null => {
  const key = day
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, '')
    .slice(0, 2)
  return DAY_MAP[key] ?? null
}

export type ParsedOpeningHours = {
  dayOfWeek: string
  opens: string
  closes: string
  venue: string | null
  group: string | null
}

export function parseTrainingSchedule(rows: TrainingSlot[]): ParsedOpeningHours[] {
  const parsed: ParsedOpeningHours[] = []

  for (const row of rows) {
    const dayOfWeek = normalizeDay(row.day)
    const match = row.time.match(TIME_RANGE)
    if (!dayOfWeek || !match) continue

    const [, openH, openM, closeH, closeM] = match
    parsed.push({
      dayOfWeek,
      opens: `${openH.padStart(2, '0')}:${openM}`,
      closes: `${closeH.padStart(2, '0')}:${closeM}`,
      venue: row.venue,
      group: row.group,
    })
  }

  return parsed
}
