import { describe, expect, it } from 'vitest'

import { toMatchJsonLd, type SportsEventInput } from '@/landing/features/matches/view/matchSchema'
import { toHomeGraph, toImageGallery, toWebPage } from '@/lib/schemaOrg'

const BASE = 'https://example.cz'

const home = toHomeGraph({
  baseUrl: BASE,
  email: 'klub@example.cz',
  sameAs: ['https://www.facebook.com/klub', null, 'https://www.instagram.com/klub/'],
})
const byId = (id: string) => home['@graph'].find((node) => node['@id'] === id)

describe('toHomeGraph', () => {
  it('je jeden @graph s týmem, halou a webem pod stabilními @id', () => {
    expect(home['@context']).toBe('https://schema.org')
    expect(home['@graph'].map((node) => node['@id'])).toEqual([
      `${BASE}/#team`,
      `${BASE}/#org`,
      `${BASE}/#arena`,
      `${BASE}/#website`,
    ])
  })

  it('každé @id je definované právě jednou', () => {
    const ids = home['@graph'].map((node) => node['@id'])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tým odkazuje na halu a web na tým přes @id, ne kopií', () => {
    expect(byId(`${BASE}/#team`)).toMatchObject({
      '@type': 'SportsTeam',
      location: { '@id': `${BASE}/#arena` },
    })
    expect(byId(`${BASE}/#website`)).toMatchObject({ publisher: { '@id': `${BASE}/#team` } })
  })

  it('sameAs vynechá prázdné profily a přidá Wikidata', () => {
    expect(byId(`${BASE}/#team`)).toMatchObject({
      sameAs: [
        'https://www.facebook.com/klub',
        'https://www.instagram.com/klub/',
        'https://www.wikidata.org/wiki/Q15980493',
      ],
    })
  })

  it('bez profilů v administraci zůstane aspoň ověřená Wikidata', () => {
    const bare = toHomeGraph({ baseUrl: BASE, email: 'a@b.cz', sameAs: [null, undefined] })
    expect(bare['@graph'][0]).toMatchObject({
      sameAs: ['https://www.wikidata.org/wiki/Q15980493'],
    })
  })

  it('hala má geo souřadnice shodné s adresou', () => {
    expect(byId(`${BASE}/#arena`)).toMatchObject({
      geo: { '@type': 'GeoCoordinates', latitude: 50.16507, longitude: 16.28106 },
      address: { streetAddress: 'Javornická 1648', postalCode: '516 01' },
    })
  })

  it('spolek nese legalName a IČO, HC je jeho oddíl', () => {
    expect(byId(`${BASE}/#org`)).toMatchObject({
      '@type': 'SportsOrganization',
      legalName: 'TJ Sokol Čestice, z.s.',
      identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: '48616061' },
    })
    expect(byId(`${BASE}/#team`)).toMatchObject({ parentOrganization: { '@id': `${BASE}/#org` } })
  })

  it('bez telefonu (do rozhodnutí klubu o veřejném kontaktu)', () => {
    for (const node of home['@graph']) expect(node).not.toHaveProperty('telephone')
  })

  it('adresa spolku je jedna a stejná jako ve zdroji pravdy', () => {
    expect(byId(`${BASE}/#team`)).toMatchObject({
      address: { streetAddress: 'Čestice 112', postalCode: '517 41', addressCountry: 'CZ' },
    })
  })
})

describe('odkazy na náš klub', () => {
  const input: SportsEventInput = {
    title: 'HC Čestice × HC Zdar',
    startDate: '2026-10-18T14:30:00.000Z',
    homeName: 'HC Čestice',
    awayName: 'HC Zdar',
    venue: null,
    status: 'scheduled',
    description: null,
    url: `${BASE}/zapasy/x`,
    image: `${BASE}/logo-cestice.png`,
  }

  it('v zápase je HC Čestice odkaz na #team, soupeř jen jméno', () => {
    const event = toMatchJsonLd(input, BASE)
    expect(event.homeTeam).toEqual({ '@id': `${BASE}/#team` })
    expect(event.awayTeam).toEqual({ '@type': 'SportsTeam', name: 'HC Zdar' })
    expect(event.competitor).toEqual([event.homeTeam, event.awayTeam])
  })

  it('venku je náš odkaz na straně hostů', () => {
    const event = toMatchJsonLd({ ...input, homeName: 'HC Zdar', awayName: 'HC Čestice' }, BASE)
    expect(event.awayTeam).toEqual({ '@id': `${BASE}/#team` })
  })
})

describe('toWebPage', () => {
  const base = { baseUrl: BASE, name: 'Partneři HC Čestice', description: 'Popis' }

  it('CollectionPage s názvem, popisem, url a odkazem na web i klub', () => {
    expect(
      toWebPage({ ...base, kind: 'CollectionPage', path: '/sponzori', aboutClub: true }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Partneři HC Čestice',
      description: 'Popis',
      url: `${BASE}/sponzori`,
      inLanguage: 'cs-CZ',
      isPartOf: { '@id': `${BASE}/#website` },
      about: { '@id': `${BASE}/#team` },
    })
  })

  it('AboutPage je o klubu, ContactPage má klub jako mainEntity', () => {
    expect(
      toWebPage({ ...base, kind: 'AboutPage', path: '/historie-klubu', aboutClub: true }),
    ).toMatchObject({
      '@type': 'AboutPage',
      about: { '@id': `${BASE}/#team` },
    })
    const contact = toWebPage({ ...base, kind: 'ContactPage', path: '/kontakt', aboutClub: true })
    expect(contact).toMatchObject({
      '@type': 'ContactPage',
      mainEntity: { '@id': `${BASE}/#team` },
    })
    expect(contact).not.toHaveProperty('about')
  })

  it('čistý výpis (aktuality) bez about', () => {
    expect(toWebPage({ ...base, kind: 'CollectionPage', path: '/aktuality' })).not.toHaveProperty(
      'about',
    )
  })

  it('nevymýšlí osoby ani sponzory (jen pole, která stránka sama ví)', () => {
    const page = toWebPage({ ...base, kind: 'CollectionPage', path: '/soupiska', aboutClub: true })
    for (const key of ['athlete', 'coach', 'mainEntity', 'itemListElement', 'sponsor']) {
      expect(page).not.toHaveProperty(key)
    }
  })
})

describe('toImageGallery', () => {
  const photos = Array.from({ length: 46 }, (_, index) => ({
    url: `${BASE}/api/media/file/f${index}.jpg`,
    caption: index === 0 ? 'Úvodní buly' : null,
  }))
  const gallery = toImageGallery({
    baseUrl: BASE,
    path: '/fotogalerie/hc-cestice-x-zh-pardubice',
    name: 'HC Čestice x ZH Pardubice',
    dateCreated: '2025-01-19',
    photos,
  })

  it('nese název, url, den akce a skutečný počet fotek', () => {
    expect(gallery).toMatchObject({
      '@type': 'ImageGallery',
      name: 'HC Čestice x ZH Pardubice',
      url: `${BASE}/fotogalerie/hc-cestice-x-zh-pardubice`,
      dateCreated: '2025-01-19',
      numberOfItems: 46,
      publisher: { '@id': `${BASE}/#team` },
    })
  })

  it('vypíše jen prvních 12 snímků jako ImageObject', () => {
    expect(gallery.image).toHaveLength(12)
    expect(gallery.image?.[0]).toEqual({
      '@type': 'ImageObject',
      contentUrl: `${BASE}/api/media/file/f0.jpg`,
      caption: 'Úvodní buly',
    })
    expect(gallery.image?.[1]).not.toHaveProperty('caption')
  })

  it('prázdná galerie a neznámé datum nemají image ani dateCreated', () => {
    const empty = toImageGallery({
      baseUrl: BASE,
      path: '/fotogalerie/x',
      name: 'X',
      dateCreated: null,
      photos: [],
    })
    expect(empty).not.toHaveProperty('image')
    expect(empty).not.toHaveProperty('dateCreated')
    expect(empty.numberOfItems).toBe(0)
  })
})
