import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { articleTrail } from '@/landing/features/posts/components/hero/articleTrail'
import { articleImages, toNewsArticle } from '@/landing/features/posts/view/articleSchema'
import { BreadcrumbsJsonLd } from '@/landing/layout/BreadcrumbsJsonLd'

const BASE = 'https://example.cz'

const media = {
  url: '/api/media/file/foto.jpg',
  updatedAt: '2026-09-24T09:54:06.000Z',
  sizes: {
    square: { url: '/api/media/file/foto-500x500.jpg' },
    og: { url: '/api/media/file/foto-1200x630.jpg' },
  },
}

const input = {
  baseUrl: BASE,
  slug: 'nove-posily',
  headline: 'Nové posily',
  description: 'Do nové sezóny vstupujeme s novými posilami.',
  images: [`${BASE}/api/media/file/foto-500x500.jpg`],
  publishedAt: '2026-08-19T06:42:28.000Z',
  modifiedAt: '2026-09-24T07:54:06.000Z',
  authorName: 'Vladimír Javůrek',
}

describe('articleImages', () => {
  it('dává čtverec, originál a og variantu s verzí v URL', () => {
    expect(articleImages({ baseUrl: BASE, media, fallback: null })).toEqual([
      `${BASE}/api/media/file/foto-500x500.jpg?2026-09-24T09%3A54%3A06.000Z`,
      `${BASE}/api/media/file/foto.jpg?2026-09-24T09%3A54%3A06.000Z`,
      `${BASE}/api/media/file/foto-1200x630.jpg?2026-09-24T09%3A54%3A06.000Z`,
    ])
  })

  it('chybějící varianty přeskočí', () => {
    expect(
      articleImages({ baseUrl: BASE, media: { ...media, sizes: undefined }, fallback: null }),
    ).toEqual([`${BASE}/api/media/file/foto.jpg?2026-09-24T09%3A54%3A06.000Z`])
  })

  it('bez fotky v článku použije fallback', () => {
    expect(
      articleImages({ baseUrl: BASE, media: null, fallback: { url: '/logo-cestice.png' } }),
    ).toEqual([`${BASE}/logo-cestice.png`])
  })
})

describe('toNewsArticle', () => {
  const article = toNewsArticle(input)

  it('má povinná i doporučená pole Article rich result', () => {
    expect(article).toMatchObject({
      '@type': 'NewsArticle',
      headline: 'Nové posily',
      image: input.images,
      datePublished: '2026-08-19T08:42:28+02:00',
      dateModified: '2026-09-24T09:54:06+02:00',
      author: { '@type': 'Person', name: 'Vladimír Javůrek' },
    })
  })

  it('publisher a web jsou odkazy na entity z home', () => {
    expect(article.publisher).toEqual({ '@id': `${BASE}/#team` })
    expect(article.isPartOf).toEqual({ '@id': `${BASE}/#website` })
    expect(article.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': `${BASE}/aktuality/nove-posily`,
    })
  })

  it('článek bez autora (fallback na klub) má za autora organizaci, ne Person', () => {
    expect(toNewsArticle({ ...input, authorName: 'HC Čestice' }).author).toEqual({
      '@type': 'SportsTeam',
      '@id': `${BASE}/#team`,
      name: 'HC Čestice',
    })
  })

  it('bez popisu, obrázků a dat je vynechá', () => {
    const bare = toNewsArticle({
      ...input,
      description: null,
      images: [],
      publishedAt: null,
      modifiedAt: null,
    })
    for (const key of ['description', 'image', 'datePublished', 'dateModified']) {
      expect(bare).not.toHaveProperty(key)
    }
  })

  it('dateModified spadne na datum publikace, když úprava chybí', () => {
    expect(toNewsArticle({ ...input, modifiedAt: null }).dateModified).toBe(
      '2026-08-19T08:42:28+02:00',
    )
  })

  it('author nemá url (stránka „O klubu" zatím neexistuje)', () => {
    expect(article.author).not.toHaveProperty('url')
  })
})

describe('articleTrail', () => {
  it('viditelně končí kategorií, ve strukturovaných datech titulkem', () => {
    const trail = articleTrail({ badge: 'Novinky', title: 'Nové posily' })
    expect(trail).toEqual([
      { href: '/aktuality', label: 'Aktuality' },
      { label: 'Novinky', schemaName: 'Nové posily' },
    ])
  })
})

describe('BreadcrumbList článku', () => {
  it('třetí položka je titulek článku, ne kategorie', () => {
    const html = renderToStaticMarkup(
      createElement(BreadcrumbsJsonLd, {
        trail: articleTrail({ badge: 'Novinky', title: 'Nové posily' }),
      }),
    )
    const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
    const list = JSON.parse(json) as { itemListElement: Array<{ position: number; name: string }> }
    expect(list.itemListElement.map((item) => item.name)).toEqual([
      'Domů',
      'Aktuality',
      'Nové posily',
    ])
  })
})
