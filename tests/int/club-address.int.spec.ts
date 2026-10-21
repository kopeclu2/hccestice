import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactInfoPanel } from '@/landing/features/contact/components/ContactInfoPanel'
import { ARENA_ADDRESS, ARENA_HOME_TEXT, CLUB_ADDRESS, CLUB_SEAT_TEXT } from '@/lib/club'
import { toHomeGraph } from '@/lib/schemaOrg'

/** Viditelný text má pevné mezery (nelámat PSČ); porovnává se s běžnými. */
const plain = (text: string) => text.replaceAll('\u00a0', ' ')

const graph = toHomeGraph({ baseUrl: 'https://example.cz', email: 'klub@example.cz', sameAs: [] })
const node = (id: string) => graph['@graph'].find((n) => n['@id'] === `https://example.cz/#${id}`)

describe('adresa klubu: JSON-LD a viditelný text berou stejné konstanty', () => {
  it('sídlo je Čestice 112, 517 41 Čestice (ARES), ne Kostelec nad Orlicí', () => {
    expect(CLUB_ADDRESS.addressLocality).toBe('Čestice')
    expect(plain(CLUB_SEAT_TEXT)).toBe(
      'TJ Sokol Čestice, z.s., Čestice 112, 517 41 Čestice (sídlo)',
    )
  })

  it('stadion je zvlášť, v krátké podobě', () => {
    expect(plain(ARENA_HOME_TEXT)).toBe(
      'Domácí stadion: Zimní stadion, Javornická 1648, 516 01 Rychnov n. K.',
    )
  })

  it('viditelný text obsahuje ulici, PSČ a obec z JSON-LD adresy sídla', () => {
    for (const id of ['team', 'org']) {
      const address = (node(id) as { address: typeof CLUB_ADDRESS }).address
      expect(plain(CLUB_SEAT_TEXT)).toContain(address.streetAddress)
      expect(plain(CLUB_SEAT_TEXT)).toContain(`${address.postalCode} ${address.addressLocality}`)
    }
  })

  it('viditelný text stadionu obsahuje ulici a PSČ z JSON-LD haly', () => {
    const address = (node('arena') as { address: typeof ARENA_ADDRESS }).address
    expect(plain(ARENA_HOME_TEXT)).toContain(address.streetAddress)
    expect(plain(ARENA_HOME_TEXT)).toContain(address.postalCode)
  })

  it('/kontakt vykreslí obě řádky z konstant', () => {
    const html = renderToStaticMarkup(
      React.createElement(ContactInfoPanel, {
        site: { email: 'klub@example.cz', facebook: null, instagram: null },
      } as React.ComponentProps<typeof ContactInfoPanel>),
    )
    expect(html).toContain(CLUB_SEAT_TEXT)
    expect(html).toContain(ARENA_HOME_TEXT)
  })
})

describe('viditelná adresa: pevné mezery', () => {
  it('PSČ, číslo domu a „n. K." se nezalamují uprostřed', () => {
    expect(CLUB_SEAT_TEXT).toContain('517\u00a041')
    expect(CLUB_SEAT_TEXT).toContain('Čestice\u00a0112')
    expect(ARENA_HOME_TEXT).toContain('516\u00a001')
    expect(ARENA_HOME_TEXT).toContain('Javornická\u00a01648')
    expect(ARENA_HOME_TEXT).toContain('n.\u00a0K.')
  })
})
