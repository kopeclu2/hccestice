import { describe, expect, it } from 'vitest'

import {
  eventEndDate,
  resolveVenue,
  toSportsEvent,
  type SportsEventInput,
} from '@/landing/features/matches/view/matchSchema'

const input: SportsEventInput = {
  title: 'HC Čestice × SK Divočáci Žamberk',
  startDate: '2026-10-18T14:30:00.000Z',
  homeName: 'HC Čestice',
  awayName: 'SK Divočáci Žamberk',
  venue: null,
  status: 'scheduled',
  description: '5. kolo',
  url: 'https://example.cz/zapasy/2026-10-18-sk-divocaci-zamberk',
  image: 'https://example.cz/logo-cestice.png',
}

describe('resolveVenue', () => {
  it('bez místa je domácí zápas na naší hale, venkovní nemá místo', () => {
    expect(resolveVenue(null, true)).toEqual({ kind: 'arena' })
    expect(resolveVenue('  ', true)).toEqual({ kind: 'arena' })
    expect(resolveVenue(null, false)).toBeNull()
  })

  it.each([
    'Zimní stadion Rychnov nad Kněžnou',
    'zimní stadion Rychnov nad Kněžnou',
    'ZS Rychnov nad Kněžnou',
    'Rychnov nad Kněžnou',
    'Rychnov n. K.',
    'Zimní stadion Rychnov n. K.',
  ])('tři názvy téže haly („%s") jsou jedna hala', (venue) => {
    expect(resolveVenue(venue, false)).toEqual({ kind: 'arena' })
  })

  it('město odvodí z holého názvu i z předpony stadionu', () => {
    expect(resolveVenue('Choceň', false)).toEqual({
      kind: 'other',
      name: 'Choceň',
      locality: 'Choceň',
    })
    expect(resolveVenue('ZS Polička', false)).toEqual({
      kind: 'other',
      name: 'ZS Polička',
      locality: 'Polička',
    })
    expect(resolveVenue('Zimní stadion Nové Město nad Metují', false)).toMatchObject({
      locality: 'Nové Město nad Metují',
    })
  })

  it('název haly nebo zkratku za město nevydává', () => {
    expect(resolveVenue('Aréna Hokej Park', false)).toMatchObject({ locality: null })
    expect(resolveVenue('Hala Vodova 12', false)).toMatchObject({ locality: null })
    expect(resolveVenue('Dobruška n. O.', false)).toMatchObject({ locality: null })
    expect(resolveVenue('rozlosování bude upřesněno', false)).toMatchObject({ locality: null })
  })
})

describe('eventEndDate', () => {
  it('je začátek + 2,5 h s lokálním offsetem', () => {
    expect(eventEndDate('2026-10-18T14:30:00.000Z')).toBe('2026-10-18T19:00:00+02:00')
    expect(eventEndDate('2026-01-18T15:30:00.000Z')).toBe('2026-01-18T19:00:00+01:00')
  })

  it('přes přechod na zimní čas sedí offset konce, ne začátku', () => {
    // 25. 10. 2026 v 00:00 UTC = 02:00 CEST; o 2,5 h později je 02:30 UTC = 03:30 CET.
    expect(eventEndDate('2026-10-25T00:00:00.000Z')).toBe('2026-10-25T03:30:00+01:00')
  })

  it('neplatné datum nemá konec', () => {
    expect(eventEndDate('nic')).toBeNull()
  })
})

describe('toSportsEvent: povinná pole Google Event', () => {
  it('domácí zápas: name, startDate, location.name + plná adresa haly', () => {
    const event = toSportsEvent(input)
    expect(event.name).toBe(input.title)
    expect(event.startDate).toBe('2026-10-18T16:30:00+02:00')
    expect(event.endDate).toBe('2026-10-18T19:00:00+02:00')
    expect(event.image).toEqual([input.image])
    expect(event.location).toEqual({
      '@type': 'Place',
      name: 'Zimní stadion Rychnov nad Kněžnou',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Javornická 1648',
        addressLocality: 'Rychnov nad Kněžnou',
        postalCode: '516 01',
        addressCountry: 'CZ',
      },
    })
  })

  it('venkovní zápas s městem: addressLocality + země', () => {
    const event = toSportsEvent({
      ...input,
      homeName: 'HC Choceň',
      awayName: 'HC Čestice',
      venue: 'Choceň',
    })
    expect(event.location).toEqual({
      '@type': 'Place',
      name: 'Choceň',
      address: { '@type': 'PostalAddress', addressLocality: 'Choceň', addressCountry: 'CZ' },
    })
  })

  it('neznámá hala: jen země, bez vymyšleného města', () => {
    const event = toSportsEvent({ ...input, homeName: 'HC X', venue: 'Aréna Hokej Park' })
    expect(event.location).toEqual({
      '@type': 'Place',
      name: 'Aréna Hokej Park',
      address: { '@type': 'PostalAddress', addressCountry: 'CZ' },
    })
  })

  it('eventStatus zůstává EventScheduled i u odehraného zápasu', () => {
    expect(toSportsEvent({ ...input, status: 'played' }).eventStatus).toBe(
      'https://schema.org/EventScheduled',
    )
  })

  it('neplatné datum nerozbije událost (endDate se vynechá)', () => {
    const event = toSportsEvent({ ...input, startDate: 'nic' })
    expect(event).not.toHaveProperty('endDate')
    expect(event.startDate).toBe('nic')
  })
})
