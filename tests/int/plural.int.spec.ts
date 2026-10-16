import { describe, expect, it } from 'vitest'

import { countLabel, plural } from '@/lib/plural'

const FORMS = ['hráč', 'hráči', 'hráčů'] as const

/** Původní ruční implementace z `landing/lib/text.ts` a `lib/plural.ts`. */
const legacy = (n: number, forms: readonly [string, string, string]): string =>
  n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2]

describe('plural', () => {
  it('0, 1, 2, 4, 5, 21, 1.5', () => {
    expect(plural(0, FORMS)).toBe('hráčů')
    expect(plural(1, FORMS)).toBe('hráč')
    expect(plural(2, FORMS)).toBe('hráči')
    expect(plural(4, FORMS)).toBe('hráči')
    expect(plural(5, FORMS)).toBe('hráčů')
    expect(plural(21, FORMS)).toBe('hráčů')
    // desetinná čísla: Intl `cs` je řadí do `many`, tedy třetí tvar
    expect(plural(1.5, FORMS)).toBe('hráčů')
  })

  it('celá čísla dávají totéž co dřívější ruční porovnání', () => {
    for (let n = 0; n <= 1000; n++) {
      expect(plural(n, FORMS), String(n)).toBe(legacy(n, FORMS))
    }
    expect(plural(1_000_000, FORMS)).toBe('hráčů')
  })

  it('vyjímky, ve kterých se nové chování od ručního liší: 2,5 a záporná čísla', () => {
    expect(legacy(2.5, FORMS)).toBe('hráči')
    expect(plural(2.5, FORMS)).toBe('hráčů')
    expect(legacy(-1, FORMS)).toBe('hráčů')
    expect(plural(-1, FORMS)).toBe('hráč')
  })

  it('stejné tvary 2–4 a 5+ (galerie, selhání) fungují', () => {
    expect([1, 2, 5].map((n) => plural(n, ['galerie', 'galerie', 'galerií']))).toEqual([
      'galerie',
      'galerie',
      'galerií',
    ])
  })
})

describe('countLabel', () => {
  it('číslo + správný tvar', () => {
    expect(countLabel(0, FORMS)).toBe('0 hráčů')
    expect(countLabel(1, FORMS)).toBe('1 hráč')
    expect(countLabel(3, FORMS)).toBe('3 hráči')
    expect(countLabel(24, FORMS)).toBe('24 hráčů')
  })

  it('číslo bez oddělovače tisíců (jako dřív)', () => {
    expect(countLabel(1234, FORMS)).toBe('1234 hráčů')
  })
})
