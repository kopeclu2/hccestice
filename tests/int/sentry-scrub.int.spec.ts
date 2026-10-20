import type { Event } from '@sentry/nextjs'
import { describe, expect, it } from 'vitest'

import {
  REDACTED,
  scrubBreadcrumb,
  scrubEvent,
  scrubTransaction,
  scrubUrl,
} from '@/lib/sentryScrub'

describe('scrubUrl', () => {
  it('skryje previewSecret a ostatní parametry nechá', () => {
    expect(scrubUrl('https://hc.cz/next/preview?previewSecret=abc123&path=/aktuality/x')).toBe(
      `https://hc.cz/next/preview?previewSecret=${REDACTED}&path=/aktuality/x`,
    )
  })

  it('skryje token v cestě obnovy hesla', () => {
    expect(scrubUrl('https://hc.cz/admin/reset/9f8e7d6c5b4a')).toBe(
      `https://hc.cz/admin/reset/${REDACTED}`,
    )
    expect(scrubUrl('/admin/reset/abc?x=1')).toBe(`/admin/reset/${REDACTED}?x=1`)
  })

  it('skryje token= a varianty bez ohledu na velikost písmen', () => {
    expect(scrubUrl('/x?token=a&Token=b&resetToken=c&access_token=d')).toBe(
      `/x?token=${REDACTED}&Token=${REDACTED}&resetToken=${REDACTED}&access_token=${REDACTED}`,
    )
  })

  it('zpracuje parametr zakódovaný procenty i neplatné kódování', () => {
    expect(scrubUrl('/x?preview%53ecret=abc')).toBe(`/x?preview%53ecret=${REDACTED}`)
    expect(() => scrubUrl('/x?%zz=1&token=2')).not.toThrow()
  })

  it('běžná URL zůstane beze změny', () => {
    for (const url of [
      'https://hc.cz/aktuality?typ=report&page=2',
      '/zapasy?sezona=2025-2026&strana=3#vysledky',
      'https://hc.cz/admin/collections/posts',
      '',
    ]) {
      expect(scrubUrl(url)).toBe(url)
    }
  })
})

describe('scrubEvent', () => {
  const event = (): Event =>
    ({
      request: {
        url: 'https://hc.cz/next/preview?previewSecret=tajne&slug=x',
        query_string: 'previewSecret=tajne&slug=x',
        headers: {
          Authorization: 'JWT abc',
          cookie: 'payload-token=abc',
          'User-Agent': 'jest',
          Referer: 'https://hc.cz/admin/reset/tok123',
        },
        cookies: { 'payload-token': 'abc' },
      },
      breadcrumbs: [
        { category: 'navigation', data: { from: '/a', to: '/admin/reset/tok123' } },
        { category: 'fetch', data: { url: '/api/x?token=zzz', method: 'GET' } },
      ],
      transaction: 'GET /admin/reset/tok123',
    }) as Event

  it('vyčistí URL, query string, hlavičky, cookies, breadcrumbs i název transakce', () => {
    const scrubbed = scrubEvent(event() as never) as Event
    const json = JSON.stringify(scrubbed)

    expect(json).not.toMatch(/tajne|tok123|zzz|JWT abc|payload-token/)
    expect(scrubbed.request?.url).toContain(`previewSecret=${REDACTED}`)
    expect(scrubbed.request?.headers).not.toHaveProperty('Authorization')
    expect(scrubbed.request?.headers).not.toHaveProperty('cookie')
    expect(scrubbed.request?.headers).toHaveProperty('User-Agent', 'jest')
    expect(scrubbed.request?.cookies).toBeUndefined()
    // Neutajovaná data zůstanou.
    expect(scrubbed.request?.url).toContain('slug=x')
  })

  it('událost bez request/breadcrumbs nespadne', () => {
    expect(() => scrubEvent({} as never)).not.toThrow()
  })

  it('query_string jako objekt a pole dvojic', () => {
    const asObject = scrubEvent({
      request: { query_string: { previewSecret: 'a', slug: 'x' } },
    } as never) as Event
    expect(asObject.request?.query_string).toEqual({ previewSecret: REDACTED, slug: 'x' })

    const asPairs = scrubEvent({
      request: {
        query_string: [
          ['token', 'a'],
          ['slug', 'x'],
        ],
      },
    } as never) as Event
    expect(asPairs.request?.query_string).toEqual([
      ['token', REDACTED],
      ['slug', 'x'],
    ])
  })
})

describe('scrubTransaction', () => {
  it('vyčistí i spany a data trasování', () => {
    const scrubbed = scrubTransaction({
      type: 'transaction',
      transaction: 'GET /next/preview',
      request: { url: 'https://hc.cz/next/preview?previewSecret=tajne' },
      contexts: { trace: { data: { 'http.url': 'https://hc.cz/x?token=t1' } } },
      spans: [
        {
          description: 'GET https://hc.cz/admin/reset/tok999',
          data: { 'http.url': 'https://hc.cz/api?secret=s1', 'http.query': 'token=q1' },
        },
      ],
    } as never) as Event

    expect(JSON.stringify(scrubbed)).not.toMatch(/tajne|t1"|tok999|s1|q1/)
  })
})

describe('scrubBreadcrumb', () => {
  it('vyčistí navigaci i fetch', () => {
    const nav = scrubBreadcrumb({
      category: 'navigation',
      data: { from: '/', to: '/admin/reset/abcdef?x=1' },
    })
    expect(nav.data?.to).toBe(`/admin/reset/${REDACTED}?x=1`)

    const fetch = scrubBreadcrumb({ category: 'fetch', data: { url: '/api/x?previewSecret=a' } })
    expect(fetch.data?.url).toBe(`/api/x?previewSecret=${REDACTED}`)
  })

  it('breadcrumb bez dat projde', () => {
    expect(scrubBreadcrumb({ message: 'ahoj' })).toEqual({ message: 'ahoj' })
  })
})
