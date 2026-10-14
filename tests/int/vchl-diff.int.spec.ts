import { describe, expect, it } from 'vitest'

import { buildPatch, normalize, sameValue } from '../../src/jobs/vchlSync/diff'

describe('vchl diff', () => {
  it('null, undefined, prázdný řetězec a false splývají', () => {
    expect(sameValue(null, undefined)).toBe(true)
    expect(sameValue('', null)).toBe(true)
    expect(sameValue(false, null)).toBe(true)
    expect(sameValue(true, null)).toBe(false)
    expect(sameValue(0, null)).toBe(false)
  })

  it('řádky polí se porovnávají bez id a nezávisle na pořadí klíčů', () => {
    const db = [{ id: 'abc', time: '30:41', side: 'ours', scorer: 5 }]
    const want = [{ scorer: 5, side: 'ours', time: '30:41', strength: null }]
    expect(sameValue(db, want)).toBe(true)
    expect(sameValue(db, [{ ...want[0], time: '30:42' }])).toBe(false)
  })

  it('pořadí řádků pole je významné (branky jsou chronologické)', () => {
    expect(sameValue([{ a: 1 }, { a: 2 }], [{ a: 2 }, { a: 1 }])).toBe(false)
  })

  it('data se porovnávají jako okamžik', () => {
    expect(sameValue('2026-10-04T14:30:00.000Z', '2026-10-04T14:30:00Z')).toBe(true)
    expect(sameValue('2026-10-04T14:30:00.000Z', '2026-10-04T14:31:00Z')).toBe(false)
  })

  it('prázdné pole = null (DB vrací [] i null)', () => {
    expect(normalize([])).toBeNull()
    expect(sameValue([], null)).toBe(true)
  })

  it('stejný vstup → žádný patch', () => {
    const existing = {
      id: 7,
      date: '2026-10-04T14:30:00.000Z',
      scoreOurs: 5,
      scoreOpp: 6,
      overtime: false,
      thirds: [{ id: 'x', ours: 0, opp: 0 }, { id: 'y', ours: 3, opp: 1 }],
      venue: 'Rychnov',
    }
    const desired = {
      date: '2026-10-04T14:30:00Z',
      scoreOurs: 5,
      scoreOpp: 6,
      overtime: false,
      thirds: [{ ours: 0, opp: 0 }, { ours: 3, opp: 1 }],
      venue: 'Rychnov',
      competition: undefined,
    }
    const r = buildPatch(existing, desired)
    expect(r.fields).toEqual([])
    expect(r.patch).toEqual({})
  })

  it('patch obsahuje jen změněná pole a before/after', () => {
    const r = buildPatch({ scoreOurs: 4, scoreOpp: 6, venue: 'A' }, { scoreOurs: 5, scoreOpp: 6, venue: 'A' })
    expect(r.fields).toEqual(['scoreOurs'])
    expect(r.patch).toEqual({ scoreOurs: 5 })
    expect(r.before).toEqual({ scoreOurs: 4 })
  })

  it('nový dokument: všechna pole jsou změna', () => {
    expect(buildPatch(null, { a: 1, b: 'x' }).fields).toEqual(['a', 'b'])
  })
})
