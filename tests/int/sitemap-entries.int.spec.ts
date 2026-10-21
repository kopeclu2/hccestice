import { describe, expect, it } from 'vitest'

import { routes } from '@/lib/routes'
import {
  buildSitemapEntries,
  hasKickoffTime,
  isUntimedMatch,
  normalizeRedirectPath,
  redirectSourceSet,
} from '@/lib/sitemapEntries'

const SITE = 'https://example.cz'

describe('redirectSourceSet', () => {
  it('normalizuje koncové lomítko a mezery, prázdné hodnoty zahodí', () => {
    const set = redirectSourceSet(['/a/', ' /b ', '', null, undefined, '/'])
    expect([...set].sort()).toEqual(['/', '/a', '/b'])
  })

  it('velikost písmen nemění (PayloadRedirects porovnává přesně)', () => {
    expect(redirectSourceSet(['/Reklama']).has('/reklama')).toBe(false)
    expect(normalizeRedirectPath('/Reklama/')).toBe('/Reklama')
  })
})

describe('hasKickoffTime', () => {
  it('půlnoc v Europe/Prague není čas výkopu (zima i léto)', () => {
    expect(hasKickoffTime('2026-01-10T23:00:00.000Z')).toBe(false) // 00:00 CET
    expect(hasKickoffTime('2026-07-10T22:00:00.000Z')).toBe(false) // 00:00 CEST
  })

  it('skutečný čas je čas výkopu', () => {
    expect(hasKickoffTime('2026-01-10T16:30:00.000Z')).toBe(true) // 17:30 CET
    expect(hasKickoffTime('2026-01-10T00:00:00.000Z')).toBe(true) // 01:00 CET
  })

  it('chybějící nebo neplatné datum čas nemá', () => {
    expect(hasKickoffTime(null)).toBe(false)
    expect(hasKickoffTime(undefined)).toBe(false)
    expect(hasKickoffTime('')).toBe(false)
    expect(hasKickoffTime('není datum')).toBe(false)
  })

  it('isUntimedMatch je jeho negace nad dokumentem', () => {
    expect(isUntimedMatch({ slug: 'a', date: '2026-01-10T23:00:00.000Z' })).toBe(true)
    expect(isUntimedMatch({ slug: 'a', date: '2026-01-10T16:30:00.000Z' })).toBe(false)
    expect(isUntimedMatch({ slug: 'a' })).toBe(true)
  })
})

describe('buildSitemapEntries', () => {
  const docs = [
    { slug: 'kontakty', updatedAt: '2026-10-01T10:00:00.000Z' },
    { slug: 'reklamni-predmety-2024-2025', updatedAt: '2026-10-02T10:00:00.000Z' },
    { slug: 'soupiska', updatedAt: '2026-10-03T10:00:00.000Z' },
    { slug: '', updatedAt: '2026-10-04T10:00:00.000Z' },
    { slug: null },
    { slug: 'bez-data' },
  ]

  it('vyřadí slug s redirectem, slug s ruční routou a dokument bez slugu', () => {
    const out = buildSitemapEntries({
      siteUrl: SITE,
      docs,
      path: routes.page,
      excludeSlugs: new Set(['soupiska']),
      redirectSources: redirectSourceSet(['/reklamni-predmety-2024-2025/']),
    })
    expect(out).toEqual([
      { loc: `${SITE}/kontakty`, lastmod: '2026-10-01T10:00:00.000Z' },
      { loc: `${SITE}/bez-data` },
    ])
  })

  it('statické cesty jdou první, bez lastmod, a dokument se stejnou URL je nezdvojí', () => {
    const out = buildSitemapEntries({
      siteUrl: SITE,
      staticPaths: ['/kontakt'],
      docs: [{ slug: 'kontakt', updatedAt: '2026-10-01T10:00:00.000Z' }],
      path: routes.page,
    })
    expect(out).toEqual([{ loc: `${SITE}/kontakt` }])
  })

  it('redirect se hledá podle cesty dokumentu, ne podle slugu (články mají prefix)', () => {
    const out = buildSitemapEntries({
      siteUrl: SITE,
      docs: [{ slug: 'a' }, { slug: 'b' }],
      path: routes.post,
      redirectSources: redirectSourceSet(['/a', '/aktuality/b']),
    })
    expect(out.map((entry) => entry.loc)).toEqual([`${SITE}/aktuality/a`])
  })

  it('zápasy: skipDoc vyřadí placeholder bez času', () => {
    const out = buildSitemapEntries({
      siteUrl: SITE,
      docs: [
        { slug: '2026-01-10-hc-zdar', date: '2026-01-10T16:30:00.000Z' },
        { slug: '2026-01-11-hc-zdar', date: '2026-01-10T23:00:00.000Z' },
      ],
      path: routes.match,
      skipDoc: isUntimedMatch,
    })
    expect(out.map((entry) => entry.loc)).toEqual([`${SITE}/zapasy/2026-01-10-hc-zdar`])
  })
})
