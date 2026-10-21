import React from 'react'

import { CONTACT } from '@/landing/content'
import { ContactFormLazy } from '@/landing/features/contact/components/ContactFormLazy'
import type { PersonCard, SiteLinks } from '@/landing/types'
import { SectionShell } from '@/landing/ui/SectionShell'

import { ContactInfoPanel } from './ContactInfoPanel'
import { ContactMap } from './ContactMap'
import { ContactPeopleCard } from './ContactPeopleCard'

/**
 * Tělo stránky `/kontakt`: vizitka, kontaktní osoby a pod nimi formulář
 * s mapou. Pod `lg` jde všechno pod sebou (formulář, pak mapa); od `lg` stojí
 * formulář a mapa vedle sebe ve dvou stejně širokých sloupcích — formulář
 * je jinak úzká karta (`max-w-170`) s prázdným místem po stranách a mapa
 * pod ním zabírala celou další obrazovku.
 * Formulář je bílý (`tone="light"`), ne tmavý panel jako na homepage.
 *
 * Vizitka a kontaktní osoby jedou na celou šířku obsahu (`SectionShell`).
 */
export function ContactPanel({ people, site }: { people: PersonCard[]; site: SiteLinks }) {
  return (
    <SectionShell spacing="content">
      <div className="flex flex-col gap-6">
        <ContactInfoPanel site={site} />
        <ContactPeopleCard people={people} />
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <ContactFormLazy tone="light" topics={[...CONTACT.topics]} />
          <ContactMap />
        </div>
      </div>
    </SectionShell>
  )
}
