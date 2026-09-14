import type { Metadata } from 'next'

import React from 'react'

import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchAllPeople, fetchSite } from '@/landing/data/site'
import { KontaktCta } from '@/landing/kontakt/KontaktCta'
import { KontaktHeader } from '@/landing/kontakt/KontaktHeader'
import { KontaktPanel } from '@/landing/kontakt/KontaktPanel'

export const revalidate = 600

/**
 * Kontakt jako samostatná stránka — dřív žil kontaktní formulář jen jako
 * sekce homepage (`#kontakt`), na kterou míří CTA napříč webem. Ta zůstává
 * beze změny; tahle stránka dává kontaktu vlastní URL, drobečky a SEO popisek
 * a vlastní kompozici (vizitka a přímé kontakty na lidi v klubu vlevo,
 * formulář vpravo, uzavírací CTA pás na konci), ne zvětšenou kopii homepage
 * karty.
 */
export default async function KontaktPage() {
  const [site, people] = await Promise.all([fetchSite(), fetchAllPeople()])

  return (
    <SubpageShell>
      <KontaktHeader />
      <KontaktPanel people={people} site={site} />
      <KontaktCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Kontakt | HC Čestice',
  description:
    'Chcete hrát, přivést dítě na trénink nebo podpořit klub? Napište nám na hccestice@seznam.cz nebo přes formulář.',
  alternates: { canonical: '/kontakt' },
}
