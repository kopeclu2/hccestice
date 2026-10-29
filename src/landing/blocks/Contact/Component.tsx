import React from 'react'

import { CONTACT } from '@/landing/content'
import { fetchSite } from '@/landing/data/site'
import { ContactCard } from '@/landing/features/contact/components/ContactCard'
import type { ContactContent } from '@/landing/features/contact/types'
import { arrayOr } from '@/landing/lib/payload'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { LandingContactBlock } from '@/payload-types'

/** Block data → view-model (fallbacky na content.ts). */
function mapContact(block: LandingContactBlock): ContactContent {
  return {
    kicker: block.kicker ?? CONTACT.kicker,
    perex: block.perex ?? CONTACT.perex,
    pills: arrayOr(block.pills, [...CONTACT.pills], (pill) => pill.text),
    topics: arrayOr(block.topics, [...CONTACT.topics], (topic) => topic.label),
  }
}

/** Kontakt: e-mail a sítě ze `siteConfig`, texty z bloku. */
export async function ContactBlockComponent({ block }: { block: LandingContactBlock }) {
  const site = await fetchSite()
  return (
    <SectionShell id="kontakt">
      <ContactCard content={mapContact(block)} site={site} />
    </SectionShell>
  )
}
