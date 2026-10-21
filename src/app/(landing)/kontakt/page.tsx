import type { Metadata } from 'next'
import React from 'react'

import { fetchAllPeople, fetchSite } from '@/landing/data/site'
import { ContactCta } from '@/landing/features/contact/components/ContactCta'
import { ContactHeader } from '@/landing/features/contact/components/ContactHeader'
import { ContactPanel } from '@/landing/features/contact/components/ContactPanel'
import { PageJsonLd } from '@/landing/layout/PageJsonLd'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { buildPageMetadata } from '@/lib/buildPageMetadata'

export const revalidate = 600

const DESCRIPTION =
  'Chceš hrát, přivést dítě na trénink nebo podpořit klub? Napiš nám na hccestice@seznam.cz nebo přes formulář.'

/**
 * Kontakt jako samostatná stránka — dřív žil kontaktní formulář jen jako
 * sekce homepage (`#kontakt`), na kterou míří CTA napříč webem. Ta zůstává
 * beze změny; tahle stránka dává kontaktu vlastní URL, drobečky a SEO popisek
 * a vlastní kompozici (vizitka a přímé kontakty na lidi v klubu vlevo,
 * formulář a mapa zimního stadionu vedle sebe, uzavírací CTA pás na konci),
 * ne zvětšenou kopii homepage karty.
 */
export default async function KontaktPage() {
  const [site, people] = await Promise.all([fetchSite(), fetchAllPeople()])

  return (
    <SubpageShell>
      <PageJsonLd
        aboutClub
        description={DESCRIPTION}
        kind="ContactPage"
        name="Kontakt HC Čestice"
        path="/kontakt"
      />
      <ContactHeader />
      <ContactPanel people={people} site={site} />
      <ContactCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Kontakt',
  description: DESCRIPTION,
  path: '/kontakt',
})
