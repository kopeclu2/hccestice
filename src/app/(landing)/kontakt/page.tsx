import type { Metadata } from 'next'
import React from 'react'

import { fetchAllPeople, fetchSite } from '@/landing/data/site'
import { ContactCta } from '@/landing/features/contact/components/ContactCta'
import { ContactHeader } from '@/landing/features/contact/components/ContactHeader'
import { ContactMap } from '@/landing/features/contact/components/ContactMap'
import { ContactPanel } from '@/landing/features/contact/components/ContactPanel'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { brandTitle } from '@/lib/brandTitle'

export const revalidate = 600

/**
 * Kontakt jako samostatná stránka — dřív žil kontaktní formulář jen jako
 * sekce homepage (`#kontakt`), na kterou míří CTA napříč webem. Ta zůstává
 * beze změny; tahle stránka dává kontaktu vlastní URL, drobečky a SEO popisek
 * a vlastní kompozici (vizitka a přímé kontakty na lidi v klubu vlevo,
 * formulář vpravo, mapa zimního stadionu a uzavírací CTA pás na konci),
 * ne zvětšenou kopii homepage karty.
 */
export default async function KontaktPage() {
  const [site, people] = await Promise.all([fetchSite(), fetchAllPeople()])

  return (
    <SubpageShell>
      <ContactHeader />
      <ContactPanel people={people} site={site} />
      <ContactMap />
      <ContactCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: brandTitle('Kontakt'),
  description:
    'Chcete hrát, přivést dítě na trénink nebo podpořit klub? Napište nám na hccestice@seznam.cz nebo přes formulář.',
  alternates: { canonical: '/kontakt' },
}
