import { describe, expect, it } from 'vitest'

import { toMatchJsonLd, type SportsEventInput } from '@/landing/features/matches/view/matchSchema'
import { toHomeGraph } from '@/lib/schemaOrg'

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

  it('sameAs vynechá prázdné profily', () => {
    expect(byId(`${BASE}/#team`)).toMatchObject({
      sameAs: ['https://www.facebook.com/klub', 'https://www.instagram.com/klub/'],
    })
    const bare = toHomeGraph({ baseUrl: BASE, email: 'a@b.cz', sameAs: [null, undefined] })
    expect(bare['@graph'][0]).not.toHaveProperty('sameAs')
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
