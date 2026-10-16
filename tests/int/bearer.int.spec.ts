import { describe, expect, it } from 'vitest'

import { hasBearerSecret, safeEqual } from '@/lib/bearer'

describe('safeEqual', () => {
  it('shodné řetězce projdou', () => {
    expect(safeEqual('tajne', 'tajne')).toBe(true)
  })

  it('jiný obsah nebo jiná délka neprojde (bez výjimky z timingSafeEqual)', () => {
    expect(safeEqual('tajne', 'tajnE')).toBe(false)
    expect(safeEqual('tajne', 'tajne2')).toBe(false)
    expect(safeEqual('', 'x')).toBe(false)
  })

  it('počítá s vícebajtovými znaky podle bajtů, ne znaků', () => {
    expect(safeEqual('žluť', 'žluť')).toBe(true)
    expect(safeEqual('žluť', 'zlut')).toBe(false)
  })
})

describe('hasBearerSecret', () => {
  it('správná hlavička projde', () => {
    expect(hasBearerSecret('Bearer abc', 'abc')).toBe(true)
  })

  it('špatné tajemství, chybějící schéma nebo prefix neprojdou', () => {
    expect(hasBearerSecret('Bearer abd', 'abc')).toBe(false)
    expect(hasBearerSecret('abc', 'abc')).toBe(false)
    expect(hasBearerSecret('bearer abc', 'abc')).toBe(false)
  })

  it('chybějící hlavička neprojde', () => {
    expect(hasBearerSecret(null, 'abc')).toBe(false)
    expect(hasBearerSecret(undefined, 'abc')).toBe(false)
    expect(hasBearerSecret('', 'abc')).toBe(false)
  })

  it('prázdné nebo nenastavené tajemství nepustí nikoho', () => {
    expect(hasBearerSecret('Bearer ', '')).toBe(false)
    expect(hasBearerSecret('Bearer ', undefined)).toBe(false)
    expect(hasBearerSecret('Bearer undefined', undefined)).toBe(false)
  })
})
