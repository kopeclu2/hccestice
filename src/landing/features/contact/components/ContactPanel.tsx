import React from 'react'

import { CONTACT } from '@/landing/content'
import { ContactFormLazy } from '@/landing/features/contact/components/ContactFormLazy'
import type { PersonCard, SiteLinks } from '@/landing/types'
import { SectionShell } from '@/landing/ui/SectionShell'

import { ContactInfoPanel } from './ContactInfoPanel'
import { ContactPeopleCard } from './ContactPeopleCard'

/**
 * Tělo stránky `/kontakt`: vizitka, kontaktní osoby a formulář pod sebou
 * v jednom sloupci — v tomhle pořadí i na mobilu, tabletu i desktopu.
 * Formulář je bílý (`tone="light"`), ne tmavý panel jako na homepage.
 *
 * Vizitka a kontaktní osoby jedou na celou šířku obsahu (`SectionShell`) —
 * jen formulář má vlastní `max-w-170` (zděděné z homepage varianty), takže
 * zůstává užší a vycentrovaný pod širšími kartami nad ním.
 */
export function ContactPanel({ people, site }: { people: PersonCard[]; site: SiteLinks }) {
  return (
    <SectionShell spacing="content">
      <div className="flex flex-col gap-6">
        <ContactInfoPanel site={site} />
        <ContactPeopleCard people={people} />
        <ContactFormLazy tone="light" topics={[...CONTACT.topics]} />
      </div>
    </SectionShell>
  )
}
