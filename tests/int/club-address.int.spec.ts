import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactInfoPanel } from '@/landing/features/contact/components/ContactInfoPanel'
import { ARENA_ADDRESS, ARENA_HOME_TEXT, CLUB_ADDRESS, CLUB_SEAT_TEXT } from '@/lib/club'
import { toHomeGraph } from '@/lib/schemaOrg'

const graph = toHomeGraph({ baseUrl: 'https://example.cz', email: 'klub@example.cz', sameAs: [] })
const node = (id: string) => graph['@graph'].find((n) => n['@id'] === `https://example.cz/#${id}`)

describe('adresa klubu: JSON-LD a viditelný text berou stejné konstanty', () => {
  it('sídlo je Čestice 112, 517 41 Čestice (ARES), ne Kostelec nad Orlicí', () => {
    expect(CLUB_ADDRESS.addressLocality).toBe('Čestice')
    expect(CLUB_SEAT_TEXT).toBe('TJ Sokol Čestice, z.s., Čestice 112, 517 41 Čestice (sídlo)')
  })

  it('stadion je zvlášť, v krátké podobě', () => {
    expect(ARENA_HOME_TEXT).toBe(
      'Domácí stadion: Zimní stadion, Javornická 1648, 516 01 Rychnov n. K.',
    )
  })

  it('viditelný text obsahuje ulici, PSČ a obec z JSON-LD adresy sídla', () => {
    for (const id of ['team', 'org']) {
      const address = (node(id) as { address: typeof CLUB_ADDRESS }).address
      expect(CLUB_SEAT_TEXT).toContain(address.streetAddress)
      expect(CLUB_SEAT_TEXT).toContain(`${address.postalCode} ${address.addressLocality}`)
    }
  })

  it('viditelný text stadionu obsahuje ulici a PSČ z JSON-LD haly', () => {
    const address = (node('arena') as { address: typeof ARENA_ADDRESS }).address
    expect(ARENA_HOME_TEXT).toContain(address.streetAddress)
    expect(ARENA_HOME_TEXT).toContain(address.postalCode)
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
