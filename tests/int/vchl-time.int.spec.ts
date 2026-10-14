import { describe, expect, it } from 'vitest'

import { pragueLocalToUtc, utcToPragueLocal } from '../../src/jobs/vchlSync/time'

const utc = (s: string) => pragueLocalToUtc(s).toISOString()

describe('vchl čas Europe/Prague → UTC', () => {
  it('letní čas (+2)', () => expect(utc('2026-10-04T16:30:00')).toBe('2026-10-04T14:30:00.000Z'))
  it('zimní čas (+1)', () => expect(utc('2026-12-05T18:00:00')).toBe('2026-12-05T17:00:00.000Z'))

  it('podzimní přechod (25. 10. 2026): před a po', () => {
    expect(utc('2026-10-24T20:00:00')).toBe('2026-10-24T18:00:00.000Z')
    expect(utc('2026-10-25T04:00:00')).toBe('2026-10-25T03:00:00.000Z')
    expect(utc('2026-10-25T16:30:00')).toBe('2026-10-25T15:30:00.000Z')
  })

  it('jarní přechod (28. 3. 2027)', () => {
    expect(utc('2027-03-27T20:00:00')).toBe('2027-03-27T19:00:00.000Z')
    expect(utc('2027-03-28T01:30:00')).toBe('2027-03-28T00:30:00.000Z')
    expect(utc('2027-03-28T16:30:00')).toBe('2027-03-28T14:30:00.000Z')
  })

  it('nezávisí na zóně stroje: zpětný převod vrátí původní čas', () => {
    for (const local of ['2026-10-04T16:30:00', '2026-12-05T18:00:00', '2027-03-28T16:30:00', '2027-07-01T00:00:00']) {
      const back = utcToPragueLocal(pragueLocalToUtc(local))
      expect(`${back.day}T${back.time}:00`).toBe(local)
    }
  })

  it('půlnoc zůstane v místním dni', () => {
    expect(utcToPragueLocal('2026-10-03T22:00:00.000Z')).toEqual({ day: '2026-10-04', time: '00:00' })
  })
})
