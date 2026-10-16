import { describe, expect, it } from 'vitest'

import { plural } from '@/lib/plural'

import { describeChanges } from '../../src/components/admin/VchlSync/format'

describe('vchl admin: skloňování', () => {
  it('plural 1 / 2–4 / 5+', () => {
    expect([1, 2, 4, 5, 0].map((n) => plural(n, ['a', 'b', 'c']))).toEqual([
      'a',
      'b',
      'b',
      'c',
      'c',
    ])
  })

  it('describeChanges: 1, 2 a 5 zápasů', () => {
    expect(describeChanges({ matchesUpdated: 1 })).toBe('1 zápas upraven')
    expect(describeChanges({ matchesUpdated: 2 })).toBe('2 zápasy upraveny')
    expect(describeChanges({ matchesUpdated: 5 })).toBe('5 zápasů upraveno')
  })

  it('describeChanges: víc položek, nulové se vynechají, nic = beze změn', () => {
    expect(describeChanges({ matchesCreated: 0, draftPosts: 2, playersCreated: 1 })).toBe(
      '2 koncepty článků, 1 hráč přidán',
    )
    expect(describeChanges({ matchesCreated: 0 })).toBe('beze změn')
  })
})
