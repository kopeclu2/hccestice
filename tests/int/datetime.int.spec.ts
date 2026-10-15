import { describe, expect, it } from 'vitest'

import {
  dayMonthParts,
  dtf,
  formatDate,
  formatDateTime,
  formatDay,
  formatFullDate,
  formatFullDateTime,
  formatLongDate,
  formatTime,
  formatWeekday,
  formatWeekdayDay,
  LOCALE,
  pragueLocalToUtc,
  TZ,
  utcToPragueLocal,
  weekdayLong,
} from '@/lib/datetime'

/** Původní implementace z `landing/lib/dates.ts` (toLocale*String). */
const legacy = {
  day: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'Europe/Prague',
    }),
  dateTime: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Prague',
    }),
  weekday: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', { weekday: 'short', timeZone: 'Europe/Prague' }),
  weekdayDay: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      timeZone: 'Europe/Prague',
    }),
  time: (iso: string) =>
    new Date(iso).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Prague',
    }),
  full: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: 'Europe/Prague',
    }),
  long: (iso: string) =>
    new Date(iso).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Prague',
    }),
}

const ISOS = [
  '2026-03-08T16:00:00.000Z', // zima
  '2026-07-15T12:30:00.000Z', // léto
  '2026-12-31T23:30:00.000Z', // půlnoc: v Praze už 1. 1. 2027
  '2026-06-30T22:30:00.000Z', // půlnoc v létě: v Praze už 1. 7.
  '2026-03-28T22:59:59.000Z', // těsně před jarním přechodem
  '2026-03-29T00:59:59.000Z', // poslední vteřina zimního času
  '2026-03-29T01:00:00.000Z', // první vteřina letního času
  '2026-10-24T22:30:00.000Z',
  '2026-10-25T01:00:00.000Z', // podzimní přechod
  '2026-10-10T17:00:00+02:00',
  '2026-10-10',
]

describe('datetime — shoda s dřívějším dates.ts', () => {
  it.each(ISOS)('%s', (iso) => {
    expect(formatDay(iso)).toBe(legacy.day(iso))
    expect(formatDateTime(iso)).toBe(legacy.dateTime(iso))
    expect(formatWeekday(iso)).toBe(legacy.weekday(iso))
    expect(formatWeekdayDay(iso)).toBe(legacy.weekdayDay(iso))
    expect(formatTime(iso)).toBe(legacy.time(iso))
    expect(formatFullDate(iso)).toBe(legacy.full(iso))
    expect(formatLongDate(iso)).toBe(legacy.long(iso))
  })
})

describe('datetime — pražský čas a půlnoc', () => {
  it('konkrétní hodnoty v zimě a v létě', () => {
    expect(formatTime('2026-03-08T16:00:00.000Z')).toBe('17:00')
    expect(formatTime('2026-07-15T12:30:00.000Z')).toBe('14:30')
    expect(formatLongDate('2026-03-08T16:00:00.000Z')).toBe('8. března 2026')
    expect(formatFullDate('2026-03-08T16:00:00.000Z')).toBe('8. 3. 2026')
    expect(formatDay('2026-03-08T16:00:00.000Z')).toBe('8. 3.')
  })

  it('23:30 UTC je v Praze už další den', () => {
    expect(formatFullDate('2026-12-31T23:30:00.000Z')).toBe('1. 1. 2027')
    expect(formatTime('2026-12-31T23:30:00.000Z')).toBe('00:30')
    expect(formatFullDate('2026-06-30T22:30:00.000Z')).toBe('1. 7. 2026')
  })

  it('přechod na letní čas: 00:59:59Z je 01:59, 01:00:00Z je 03:00', () => {
    expect(formatTime('2026-03-29T00:59:59.000Z')).toBe('01:59')
    expect(formatTime('2026-03-29T01:00:00.000Z')).toBe('03:00')
  })

  it('formatFullDateTime = původní formatter z admin/VchlSync/format.ts', () => {
    const adminLegacy = new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Prague',
    })
    for (const iso of ISOS) {
      expect(formatFullDateTime(iso)).toBe(adminLegacy.format(new Date(iso)))
    }
  })

  it('weekdayLong a dayMonthParts = shared.tsx (weekday, dayMonth)', () => {
    const iso = '2026-10-10T14:00:00.000Z'
    expect(weekdayLong(iso)).toBe('sobota')
    expect(dayMonthParts(iso)).toEqual({ day: '10', month: '10' })
    expect(dayMonthParts('2026-12-31T23:30:00.000Z')).toEqual({ day: '1', month: '1' })
  })

  it('neplatné datum: bez výjimky, prázdný řetězec / null', () => {
    expect(formatTime('nesmysl')).toBe('')
    expect(formatDate('nesmysl', { year: 'numeric' })).toBe('')
    expect(weekdayLong('nesmysl')).toBeNull()
    expect(dayMonthParts('nesmysl')).toBeNull()
  })

  it('přijímá Date i epoch', () => {
    const ms = Date.parse('2026-03-08T16:00:00.000Z')
    expect(formatTime(ms)).toBe('17:00')
    expect(formatTime(new Date(ms))).toBe('17:00')
  })
})

describe('dtf', () => {
  it('memoizuje podle voleb, na pořadí klíčů nezáleží', () => {
    const a = dtf({ day: 'numeric', month: 'long' })
    const b = dtf({ month: 'long', day: 'numeric' })
    expect(a).toBe(b)
    expect(dtf({ day: 'numeric' })).not.toBe(a)
  })

  it('výchozí zóna a locale', () => {
    const resolved = dtf({ hour: 'numeric' }).resolvedOptions()
    expect(resolved.timeZone).toBe(TZ)
    expect(resolved.locale).toBe(LOCALE)
  })

  it('jiná zóna nebo locale je jiný formatter', () => {
    expect(dtf({ hour: 'numeric', timeZone: 'UTC' })).not.toBe(dtf({ hour: 'numeric' }))
    expect(dtf({ hour: 'numeric' }, 'en-CA')).not.toBe(dtf({ hour: 'numeric' }))
  })
})

describe('pragueLocalToUtc / utcToPragueLocal', () => {
  it('letní a zimní čas', () => {
    expect(pragueLocalToUtc('2026-10-04T16:30:00').toISOString()).toBe('2026-10-04T14:30:00.000Z')
    expect(pragueLocalToUtc('2026-12-05T18:00:00').toISOString()).toBe('2026-12-05T17:00:00.000Z')
  })

  it('půlnoc v létě i v zimě', () => {
    expect(pragueLocalToUtc('2026-07-01T00:00:00').toISOString()).toBe('2026-06-30T22:00:00.000Z')
    expect(pragueLocalToUtc('2027-01-01T00:00:00').toISOString()).toBe('2026-12-31T23:00:00.000Z')
  })

  it('zpáteční převod', () => {
    expect(utcToPragueLocal('2026-06-30T22:30:00.000Z')).toEqual({
      day: '2026-07-01',
      time: '00:30',
    })
    expect(utcToPragueLocal(new Date('2026-12-31T23:00:00.000Z'))).toEqual({
      day: '2027-01-01',
      time: '00:00',
    })
  })

  it('neplatný lokální formát hází', () => {
    expect(() => pragueLocalToUtc('4. 10. 2026')).toThrow()
  })
})
