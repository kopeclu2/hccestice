import { describe, expect, it } from 'vitest'

import {
  collectionBySegment,
  collectionDocPath,
  collectionPrefix,
  linkOrNull,
  routes,
} from '@/lib/routes'

describe('routes', () => {
  it('detaily', () => {
    expect(routes.post('treninky-hc-cestice')).toBe('/aktuality/treninky-hc-cestice')
    expect(routes.match('2026-10-10-hc-policka-b')).toBe('/zapasy/2026-10-10-hc-policka-b')
    expect(routes.gallery('turnaj-2026')).toBe('/fotogalerie/turnaj-2026')
    expect(routes.product('dres')).toBe('/produkty/dres')
  })

  it('výpisy a domů', () => {
    expect(routes.home).toBe('/')
    expect(routes.list).toEqual({
      posts: '/aktuality',
      matches: '/zapasy',
      galleries: '/fotogalerie',
    })
  })

  it('page: home, prázdný slug a null jsou domovská stránka', () => {
    expect(routes.page('home')).toBe('/')
    expect(routes.page('')).toBe('/')
    expect(routes.page(undefined)).toBe('/')
    expect(routes.page(null)).toBe('/')
    expect(routes.page('kontakty')).toBe('/kontakty')
  })

  it('funkce se dají předat jako argument (bez `this`)', () => {
    const { post } = routes
    expect(post('a')).toBe('/aktuality/a')
    expect(['a', 'b'].map(routes.match)).toEqual(['/zapasy/a', '/zapasy/b'])
  })
})

describe('linkOrNull', () => {
  it('dokument bez slugu odkaz nemá', () => {
    expect(linkOrNull(routes.match, null)).toBeNull()
    expect(linkOrNull(routes.match, undefined)).toBeNull()
    expect(linkOrNull(routes.post, '')).toBeNull()
  })

  it('se slugem dává stejné URL jako dřívější postPath / matchPath', () => {
    expect(linkOrNull(routes.post, 'abc')).toBe('/aktuality/abc')
    expect(linkOrNull(routes.match, 'abc')).toBe('/zapasy/abc')
  })
})

describe('collectionPrefix a collectionDocPath', () => {
  it('prefixy veřejných kolekcí', () => {
    expect(collectionPrefix).toEqual({
      pages: '',
      posts: '/aktuality',
      galleries: '/fotogalerie',
      matches: '/zapasy',
      products: '/produkty',
    })
  })

  it('collectionDocPath: pages žijí na /[slug], ostatní pod svým prefixem', () => {
    expect(collectionDocPath('pages', 'kontakty')).toBe('/kontakty')
    expect(collectionDocPath('posts', 'a')).toBe('/aktuality/a')
    expect(collectionDocPath('galleries', 'g')).toBe('/fotogalerie/g')
    expect(collectionDocPath('matches', 'm')).toBe('/zapasy/m')
  })

  it('neznámá kolekce se chová jako pages (rich text to tak dělal)', () => {
    expect(collectionDocPath('neexistuje', 'x')).toBe('/x')
  })

  it('shoduje se s prefixy z generatePreviewPath (posts, pages)', () => {
    const legacy: Record<string, string> = { posts: '/aktuality', pages: '' }
    for (const [collection, prefix] of Object.entries(legacy)) {
      expect(collectionPrefix[collection as 'posts' | 'pages']).toBe(prefix)
    }
  })
})

describe('collectionBySegment', () => {
  it('první segment URL → kolekce; pages tam nejsou', () => {
    expect(collectionBySegment).toEqual({
      aktuality: 'posts',
      fotogalerie: 'galleries',
      zapasy: 'matches',
      produkty: 'products',
    })
  })
})
