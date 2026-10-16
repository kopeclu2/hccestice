import { describe, expect, it } from 'vitest'

import { getClientIp } from '@/lib/rateLimit'

const h = (init: Record<string, string>) => new Headers(init)

describe('getClientIp', () => {
  it('jediná adresa v x-forwarded-for', () => {
    expect(getClientIp(h({ 'x-forwarded-for': '203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('bere poslední záznam, ne první (první si může podvrhnout klient)', () => {
    expect(getClientIp(h({ 'x-forwarded-for': '1.2.3.4, 203.0.113.7' }))).toBe('203.0.113.7')
    expect(getClientIp(h({ 'x-forwarded-for': '1.2.3.4,  10.0.0.1 , 203.0.113.7 ' }))).toBe(
      '203.0.113.7',
    )
  })

  it('přeskočí prázdné záznamy', () => {
    expect(getClientIp(h({ 'x-forwarded-for': '203.0.113.7, ,' }))).toBe('203.0.113.7')
  })

  it('bez x-forwarded-for jde na x-real-ip', () => {
    expect(getClientIp(h({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(getClientIp(h({ 'x-forwarded-for': ' , ', 'x-real-ip': '198.51.100.2' }))).toBe(
      '198.51.100.2',
    )
  })

  it('bez hlaviček vrací unknown', () => {
    expect(getClientIp(h({}))).toBe('unknown')
  })
})
