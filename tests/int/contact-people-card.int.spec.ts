import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContactPeopleCard } from '@/landing/features/contact/components/ContactPeopleCard'
import type { PersonCard } from '@/landing/types'

const person = (overrides: Partial<PersonCard>): PersonCard => ({
  mail: null,
  name: 'Jan Novák',
  note: null,
  phone: null,
  photo: null,
  role: 'Trenér mužů',
  ...overrides,
})

const render = (people: PersonCard[]) =>
  renderToStaticMarkup(React.createElement(ContactPeopleCard, { people }))

describe('ContactPeopleCard', () => {
  it('ukáže osobu i bez telefonu a e-mailu (jméno a role, žádný odkaz)', () => {
    const html = render([person({})])
    expect(html).toContain('Jan Novák')
    expect(html).toContain('Trenér mužů')
    expect(html).not.toContain('tel:')
    expect(html).not.toContain('mailto:')
  })

  it('u osoby s kontaktem vykreslí telefon i e-mail jako odkazy', () => {
    const html = render([person({ mail: 'klub@example.cz', phone: '+420 600 123 456' })])
    expect(html).toContain('tel:+420600123456')
    expect(html).toContain('mailto:klub@example.cz')
  })

  it('smíchá osoby s kontaktem a bez něj, všechny zůstanou', () => {
    const html = render([
      person({ name: 'Eva Dvořáková', phone: '+420 600 123 456' }),
      person({ name: 'Petr Svoboda' }),
    ])
    expect(html).toContain('Eva Dvořáková')
    expect(html).toContain('Petr Svoboda')
  })

  it('bez lidí nevykreslí nic (ani nadpis)', () => {
    expect(render([])).toBe('')
  })
})
