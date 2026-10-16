import { describe, expect, it } from 'vitest'

import { CLUB_LOGO, CLUB_NAME, CLUB_PREFIXES, SITE_NAME } from '@/lib/club'
import { errorMessage } from '@/lib/errors'

describe('errorMessage', () => {
  it('Error → message', () => {
    expect(errorMessage(new Error('spadlo to'))).toBe('spadlo to')
    expect(errorMessage(new TypeError('špatný typ'))).toBe('špatný typ')
  })

  it('cokoli jiného → String()', () => {
    expect(errorMessage('řetězec')).toBe('řetězec')
    expect(errorMessage(42)).toBe('42')
    expect(errorMessage(null)).toBe('null')
    expect(errorMessage(undefined)).toBe('undefined')
    expect(errorMessage({ toString: () => 'vlastní' })).toBe('vlastní')
  })
})

describe('club', () => {
  it('konstanty se nezměnily proti čtyřem původním literálům', () => {
    expect(CLUB_NAME).toBe('HC Čestice')
    expect(SITE_NAME).toBe('HC Čestice')
    expect(CLUB_LOGO).toBe('/logo-cestice.png')
  })

  it('předpony jsou velkými písmeny (teamName porovnává přes toUpperCase)', () => {
    for (const prefix of CLUB_PREFIXES) expect(prefix).toBe(prefix.toUpperCase())
  })
})
