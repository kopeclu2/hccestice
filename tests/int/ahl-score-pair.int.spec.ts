import { describe, expect, it } from 'vitest'

import { pad2, parseScorePair } from '../../src/ahl/parse/dom'

describe('ahl: parseScorePair', () => {
  it('čte dvojici s mezerami i bez nich', () => {
    expect(parseScorePair('3:1')).toEqual({ home: 3, away: 1, rest: '' })
    expect(parseScorePair('  5 : 6 ')).toEqual({ home: 5, away: 6, rest: '' })
    expect(parseScorePair('12:0')).toEqual({ home: 12, away: 0, rest: '' })
  })

  it('nedělitelná mezera je mezera', () => {
    expect(parseScorePair(' 3 : 1 ')).toEqual({ home: 3, away: 1, rest: '' })
  })

  it('zbytek za dvojicí vrací v `rest`', () => {
    expect(parseScorePair('3:1 pp')).toEqual({ home: 3, away: 1, rest: 'pp' })
    expect(parseScorePair('3:1sn')).toEqual({ home: 3, away: 1, rest: 'sn' })
    expect(parseScorePair('45:20 (+3)')).toEqual({ home: 45, away: 20, rest: '(+3)' })
  })

  it('bez dvojice na začátku je to null', () => {
    expect(parseScorePair('')).toBeNull()
    expect(parseScorePair('-')).toBeNull()
    expect(parseScorePair('3')).toBeNull()
    expect(parseScorePair('3:')).toBeNull()
    expect(parseScorePair('x 3:1')).toBeNull()
    expect(parseScorePair('2.10.2026 3:1')).toBeNull()
  })
})

describe('ahl: pad2', () => {
  it('doplní nulu jen jednociferným', () => {
    expect(pad2(0)).toBe('00')
    expect(pad2(7)).toBe('07')
    expect(pad2(12)).toBe('12')
  })
})
