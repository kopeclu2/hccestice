import { describe, expect, it } from 'vitest'

import { routes } from '@/lib/routes'
import {
  buildSitemapEntries,
  hasKickoffTime,
  isUntimedMatch,
  normalizeRedirectPath,
  redirectSourceSet,
  resolveLastmod,
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

describe('resolveLastmod', () => {
  const IMPORT = '2026-08-18T10:00:00.000Z'

  it('reálná změna (updatedAt o víc než den po createdAt) vrátí updatedAt', () => {
    const doc = { createdAt: IMPORT, updatedAt: '2026-09-20T08:00:00.000Z' }
    expect(resolveLastmod(doc, 'publishedAt')).toBe(doc.updatedAt)
  })

  it('import (rozdíl pod 1 den) vezme publishedAt článku', () => {
    const doc = {
      createdAt: IMPORT,
      updatedAt: '2026-08-18T10:00:05.000Z',
      publishedAt: '2019-03-02T12:00:00.000Z',
    }
    expect(resolveLastmod(doc, 'publishedAt')).toBe('2019-03-02T12:00:00.000Z')
  })

  it('import galerie vezme date', () => {
    const doc = {
      createdAt: IMPORT,
      updatedAt: IMPORT,
      date: '2024-11-09T00:00:00.000Z',
    }
    expect(resolveLastmod(doc, 'date')).toBe('2024-11-09T00:00:00.000Z')
  })

  it('import bez náhradního pole (nebo s neplatným) lastmod vynechá', () => {
    expect(resolveLastmod({ createdAt: IMPORT, updatedAt: IMPORT }, 'date')).toBeUndefined()
    expect(
      resolveLastmod({ createdAt: IMPORT, updatedAt: IMPORT, date: 'nesmysl' }, 'date'),
    ).toBeUndefined()
  })

  it('hranice jednoho dne: přesně 24 h už je změna', () => {
    const doc = {
      createdAt: IMPORT,
      updatedAt: '2026-08-19T10:00:00.000Z',
      publishedAt: '2019-01-01',
    }
    expect(resolveLastmod(doc, 'publishedAt')).toBe(doc.updatedAt)
  })

  it('bez náhradního zdroje (stránky, zápasy) se chování nemění', () => {
    expect(resolveLastmod({ createdAt: IMPORT, updatedAt: IMPORT })).toBe(IMPORT)
    expect(resolveLastmod({})).toBeUndefined()
  })

  it('bez createdAt nelze import poznat, zůstává updatedAt', () => {
    expect(resolveLastmod({ updatedAt: IMPORT, publishedAt: '2019-01-01' }, 'publishedAt')).toBe(
      IMPORT,
    )
  })
})

describe('buildSitemapEntries: lastmodFallback', () => {
  it('importované položky dostanou publishedAt, změněné updatedAt, bez zdroje lastmod chybí', () => {
    const entries = buildSitemapEntries({
      siteUrl: SITE,
      path: routes.post,
      lastmodFallback: 'publishedAt',
      docs: [
        {
          slug: 'import',
          createdAt: '2026-08-18T10:00:00.000Z',
          updatedAt: '2026-08-18T10:00:01.000Z',
          publishedAt: '2020-05-05T10:00:00.000Z',
        },
        {
          slug: 'zmena',
          createdAt: '2026-08-18T10:00:00.000Z',
          updatedAt: '2026-10-01T10:00:00.000Z',
          publishedAt: '2020-05-05T10:00:00.000Z',
        },
        {
          slug: 'bez-data',
          createdAt: '2026-08-18T10:00:00.000Z',
          updatedAt: '2026-08-18T10:00:01.000Z',
        },
      ],
    })
    expect(entries.map((e) => e.lastmod)).toEqual([
      '2020-05-05T10:00:00.000Z',
      '2026-10-01T10:00:00.000Z',
      undefined,
    ])
    expect('lastmod' in entries[2]!).toBe(false)
  })

  it('bez lastmodFallback zůstává updatedAt (pages, matches)', () => {
    const [entry] = buildSitemapEntries({
      siteUrl: SITE,
      path: routes.page,
      docs: [
        { slug: 'a', createdAt: '2026-08-18T10:00:00.000Z', updatedAt: '2026-08-18T10:00:01.000Z' },
      ],
    })
    expect(entry?.lastmod).toBe('2026-08-18T10:00:01.000Z')
  })
})
