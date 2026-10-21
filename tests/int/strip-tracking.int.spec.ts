import { describe, expect, it } from 'vitest'

import { stripTracking } from '@/lib/stripTracking'

describe('stripTracking', () => {
  it('klubový Facebook (profile.php?id=…) zůstane celý, jen se odstraní trackery', () => {
    const club = 'https://www.facebook.com/profile.php?id=61568735361560'
    expect(stripTracking(club)).toBe(club)
    expect(stripTracking(`${club}&fbclid=IwY2xjawGfuF5`)).toBe(club)
  })

  it('prázdná hodnota je null', () => {
    expect(stripTracking(undefined)).toBeNull()
    expect(stripTracking('  ')).toBeNull()
  })
})
