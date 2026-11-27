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

describe('getClientIp za Cloudflare', () => {
  it('z uzlu Cloudflare věří cf-connecting-ip (IPv4 i IPv6)', () => {
    expect(
      getClientIp(h({ 'x-forwarded-for': '188.114.96.9', 'cf-connecting-ip': '203.0.113.7' })),
    ).toBe('203.0.113.7')
    expect(
      getClientIp(h({ 'x-forwarded-for': '2a06:98c1:3120::9', 'cf-connecting-ip': '2001:db8::5' })),
    ).toBe('2001:db8::5')
  })

  it('z jiné adresy než Cloudflare hlavičku ignoruje (nejde podvrhnout)', () => {
    expect(
      getClientIp(h({ 'x-forwarded-for': '198.51.100.2', 'cf-connecting-ip': '203.0.113.7' })),
    ).toBe('198.51.100.2')
  })

  it('uzel Cloudflare bez hlavičky nebo s nesmyslnou hlavičkou vrátí adresu uzlu', () => {
    expect(getClientIp(h({ 'x-forwarded-for': '188.114.96.9' }))).toBe('188.114.96.9')
    expect(getClientIp(h({ 'x-forwarded-for': '188.114.96.9', 'cf-connecting-ip': 'ahoj' }))).toBe(
      '188.114.96.9',
    )
  })

  it('poslední záznam rozhoduje: podvržená hlavička před Cloudflare neprojde', () => {
    expect(
      getClientIp(
        h({ 'x-forwarded-for': '188.114.96.9, 198.51.100.2', 'cf-connecting-ip': '203.0.113.7' }),
      ),
    ).toBe('198.51.100.2')
  })
})
