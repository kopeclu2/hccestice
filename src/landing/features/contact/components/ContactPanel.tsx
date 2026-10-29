import React from 'react'

import { CONTACT } from '@/landing/content'
import type { PersonCard, SiteLinks } from '@/landing/types'
import { SectionShell } from '@/landing/ui/SectionShell'

import { ContactCard } from './ContactCard'
import { ContactPeopleCard } from './ContactPeopleCard'

/**
 * Tělo stránky `/kontakt`: kontaktní osoby, tatáž velká karta jako sekce
 * `#kontakt` na homepage (e-mail, údaje, sítě a formulář) bez rámečku
 * a bez dekorací. Texty karty jsou z `content.ts`
 * (stránka není dokument v CMS; homepage je bere z bloku).
 *
 * Varianta z 29. 10. 2026; původní kompozici (`ContactInfoPanel` vizitka,
 * bílý formulář `tone="light"` vedle mapy) vrátí git.
 */
export function ContactPanel({ people, site }: { people: PersonCard[]; site: SiteLinks }) {
  return (
    <SectionShell spacing="content">
      <div className="flex flex-col gap-6">
        <ContactPeopleCard people={people} />
        <ContactCard
          formTone="light"
          decor={false}
          framed={false}
          intro={false}
          content={{
            kicker: CONTACT.kicker,
            perex: CONTACT.perex,
            pills: [...CONTACT.pills],
            topics: [...CONTACT.topics],
          }}
          site={site}
        />
      </div>
    </SectionShell>
  )
}
