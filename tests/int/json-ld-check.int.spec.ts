import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from '@/lib/jsonLd'
import { checkJsonLd, extractJsonLd } from '@/lib/jsonLdCheck'

import { sampleDocuments } from '../../scripts/jsonld-samples'

const event = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'HC Čestice × HC Zdar',
  startDate: '2026-10-18T16:30:00+02:00',
  endDate: '2026-10-18T19:00:00+02:00',
  image: ['https://example.cz/logo.png'],
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'Zimní stadion',
    address: { '@type': 'PostalAddress', addressLocality: 'Rychnov', addressCountry: 'CZ' },
  },
}

describe('skutečné buildery stránek procházejí kontrolou bez chyby', () => {
  for (const [name, doc] of Object.entries(sampleDocuments)) {
    it(name, () => {
      expect(checkJsonLd(doc, name).errors).toEqual([])
    })
  }
})

describe('checkJsonLd: Event', () => {
  it('úplná událost je bez chyb i varování', () => {
    expect(checkJsonLd(event)).toEqual({ errors: [], warnings: [] })
  })

  it('location bez address je chyba (původní nález auditu)', () => {
    const doc = { ...event, location: { '@type': 'Place', name: 'Choceň' } }
    expect(checkJsonLd(doc).errors).toContainEqual(expect.stringContaining('address'))
  })

  it('chybějící location, name a startDate jsou chyby', () => {
    const { location: _location, ...noLocation } = event
    expect(checkJsonLd(noLocation).errors.join()).toContain('chybí location')
    expect(checkJsonLd({ ...event, name: '' }).errors.join()).toContain('chybí name')
    const { startDate: _startDate, ...noStart } = event
    expect(checkJsonLd(noStart).errors.join()).toContain('chybí startDate')
  })

  it('EventCompleted není schema.org', () => {
    const doc = { ...event, eventStatus: 'https://schema.org/EventCompleted' }
    expect(checkJsonLd(doc).errors.join()).toContain('EventCompleted')
  })

  it('startDate v UTC projde, ale s varováním; neplatné datum je chyba', () => {
    const utc = checkJsonLd({ ...event, startDate: '2026-10-18T14:30:00.000Z' })
    expect(utc.errors).toEqual([])
    expect(utc.warnings.join()).toContain('offset')
    expect(checkJsonLd({ ...event, startDate: '18. 10. 2026' }).errors.join()).toContain('ISO 8601')
  })

  it('location jako @id odkaz se dohledá v @graph téhož dokumentu', () => {
    const place = { ...event.location, '@id': 'https://example.cz/#arena' }
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [place, { ...event, location: { '@id': 'https://example.cz/#arena' } }],
    }
    expect(checkJsonLd(graph).errors).toEqual([])
    const dangling = { ...event, location: { '@id': 'https://example.cz/#arena' } }
    expect(checkJsonLd(dangling).errors.join()).toContain('mimo dokument')
  })

  it('stejné @id definované dvakrát je chyba', () => {
    const place = { ...event.location, '@id': 'https://example.cz/#arena' }
    const doc = { '@context': 'https://schema.org', '@graph': [place, place, event] }
    expect(checkJsonLd(doc).errors.join()).toContain('víckrát')
  })
})

describe('checkJsonLd: NewsArticle a BreadcrumbList', () => {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: 'Nové posily',
    image: ['https://example.cz/a.jpg'],
    datePublished: '2026-08-19T08:42:28+02:00',
    author: { '@type': 'Person', name: 'Jan' },
    publisher: { '@type': 'SportsTeam', name: 'HC Čestice' },
  }

  it('úplný článek je bez chyb', () => {
    expect(checkJsonLd(article).errors).toEqual([])
  })

  it('bez headline, image a datePublished jsou chyby', () => {
    const { headline: _h, image: _i, datePublished: _d, ...bare } = article
    const errors = checkJsonLd(bare).errors.join()
    expect(errors).toContain('headline')
    expect(errors).toContain('image')
    expect(errors).toContain('datePublished')
  })

  it('drobečky: položka bez item (mimo poslední) je chyba', () => {
    const doc = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Domů' },
        { '@type': 'ListItem', position: 2, name: 'Aktuality' },
      ],
    }
    expect(checkJsonLd(doc).errors.join()).toContain('item')
  })

  it('chybný @context je chyba', () => {
    expect(checkJsonLd({ ...article, '@context': 'http://example.org' }).errors.join()).toContain(
      '@context',
    )
  })
})

describe('extractJsonLd', () => {
  it('vytáhne bloky ze serializovaného HTML, i když v hodnotě je </script>', () => {
    const html =
      `<html><script type="application/ld+json">${serializeJsonLd({ a: '</script>' })}</script>` +
      `<script type="application/ld+json">${serializeJsonLd(event)}</script></html>`
    const docs = extractJsonLd(html)
    expect(docs).toHaveLength(2)
    expect(docs[0]).toEqual({ a: '</script>' })
    expect(checkJsonLd(docs[1]).errors).toEqual([])
  })
})
