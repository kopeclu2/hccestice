import { describe, expect, it } from 'vitest'

import { brandTitle } from '@/lib/brandTitle'
import { SITE_NAME } from '@/lib/club'

const SUFFIX = ` | ${SITE_NAME}`

describe('brandTitle', () => {
  it('prázdný vstup dá samotný název webu', () => {
    expect(brandTitle()).toBe(SITE_NAME)
    expect(brandTitle(null)).toBe(SITE_NAME)
    expect(brandTitle('')).toBe(SITE_NAME)
    expect(brandTitle('   ')).toBe(SITE_NAME)
  })

  it('přidá značku a ořízne okraje', () => {
    expect(brandTitle('  Aktuality ')).toBe(`Aktuality${SUFFIX}`)
  })

  it('je idempotentní a nezdvojí značku na konci ani na začátku', () => {
    const once = brandTitle('Nové posily')
    expect(brandTitle(once)).toBe(once)
    expect(brandTitle('HC Čestice — hokejový klub | TJ Sokol Čestice')).toBe(
      'HC Čestice — hokejový klub | TJ Sokol Čestice',
    )
    expect(brandTitle('HC Polička B x HC Čestice')).toBe('HC Polička B x HC Čestice')
  })

  it('délka titulku na výsledek nemá vliv: značka se přidá vždy', () => {
    // 47 + 13 = 60 znaků, 48 + 13 = 61 (hranice SERP), 200 znaků
    for (const length of [1, 47, 48, 60, 200]) {
      const title = 'x'.repeat(length)
      expect(brandTitle(title)).toBe(`${title}${SUFFIX}`)
    }
    expect(SUFFIX.length).toBe(13)
  })

  it('porovnání je citlivé na velikost písmen', () => {
    expect(brandTitle('hc čestice doma')).toBe(`hc čestice doma${SUFFIX}`)
  })
})
