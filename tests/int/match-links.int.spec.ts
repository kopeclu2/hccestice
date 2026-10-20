import { describe, expect, it } from 'vitest'

import {
  toFixtureCard,
  toFormSquare,
  toLastResult,
  toMatchRow,
  toResultRow,
  toUpcoming,
} from '@/landing/features/matches/view/matchRows'
import { eventDescription, toSportsEvent } from '@/landing/features/matches/view/matchSchema'

import type { Match } from '../../src/payload-types'

const opponent = {
  id: 5,
  name: 'HC Zdar',
  slug: 'hc-zdar',
  logo: null,
  updatedAt: '',
  createdAt: '',
}

const baseMatch = (overrides: Partial<Match> = {}): Match =>
  ({
    id: 10,
    slug: '2025-10-12-hc-zdar',
    date: '2025-10-12T14:00:00.000Z',
    competition: 'VČHL 18. kolo',
    opponent,
    home: true,
    status: 'played',
    scoreOurs: 5,
    scoreOpp: 3,
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }) as Match

const withSlug = baseMatch()
const withoutSlug = baseMatch({ slug: null } as Partial<Match>)

/** Každé zobrazení zápasu — jeden mapovač = jeden případ. */
const MAPPERS: Array<[string, (match: Match) => { href: string | null }]> = [
  ['MatchRow', toMatchRow],
  ['UpcomingMatch', toUpcoming],
  ['LastResult', toLastResult],
  ['FixtureCard', (match) => toFixtureCard(match, false)],
  ['ResultRow', toResultRow],
  ['FormSquare', toFormSquare],
]

describe('odkaz na detail zápasu ve view-modelech', () => {
  it.each(MAPPERS)('%s: href vznikne ze slugu', (_name, map) => {
    expect(map(withSlug).href).toBe('/zapasy/2025-10-12-hc-zdar')
  })

  it.each(MAPPERS)('%s: bez slugu je href null', (_name, map) => {
    expect(map(withoutSlug).href).toBeNull()
  })
})

describe('SportsEvent', () => {
  const input = {
    title: 'HC Čestice × HC Zdar',
    startDate: '2025-10-12T14:00:00.000Z',
    homeName: 'HC Čestice',
    awayName: 'HC Zdar',
    venue: null,
    status: 'played' as const,
    description: eventDescription('18. kolo', '5:3', 'HC Čestice', 'HC Zdar'),
    url: 'https://example.cz/zapasy/2025-10-12-hc-zdar',
    image: 'https://example.cz/logo-cestice.png',
  }

  it('startDate nese lokální offset Europe/Prague (léto +02:00, zima +01:00)', () => {
    expect(toSportsEvent(input).startDate).toBe('2025-10-12T16:00:00+02:00')
    expect(toSportsEvent({ ...input, startDate: '2026-01-18T15:30:00.000Z' }).startDate).toBe(
      '2026-01-18T16:30:00+01:00',
    )
  })

  it('nese url detailu a popis s výsledkem', () => {
    const event = toSportsEvent(input)
    expect(event.url).toBe(input.url)
    expect(event.description).toBe('18. kolo — HC Čestice 5:3 HC Zdar')
  })

  it('doma bez místa doplní domácí led, venku místo vynechá', () => {
    expect(toSportsEvent(input).location).toMatchObject({
      '@type': 'Place',
      name: 'Zimní stadion Rychnov nad Kněžnou',
    })
    expect(
      toSportsEvent({ ...input, homeName: 'HC Zdar', awayName: 'HC Čestice' }),
    ).not.toHaveProperty('location')
  })

  it('zrušený zápas je EventCancelled, odehraný zůstává EventScheduled', () => {
    expect(toSportsEvent({ ...input, status: 'canceled' }).eventStatus).toBe(
      'https://schema.org/EventCancelled',
    )
    expect(toSportsEvent(input).eventStatus).toBe('https://schema.org/EventScheduled')
  })

  it('nehraný zápas má popis jen s fází', () => {
    expect(eventDescription('19. kolo', null, 'HC Čestice', 'HC Zdar')).toBe('19. kolo')
  })
})
