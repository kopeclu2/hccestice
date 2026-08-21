import type { Metadata } from 'next'

import React from 'react'

import { GlowCircle } from '@/landing/components/Decorations'
import { Reveal } from '@/landing/components/Reveal'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { countLabel } from '@/landing/data/format'
import { fetchSeason, seasonShortLabel } from '@/landing/data/seasons'
import { fetchSponsors } from '@/landing/data/sponsors'
import { PartnerRow } from '@/landing/sponzori/PartnerRow'
import { PartnerSlotCta } from '@/landing/sponzori/PartnerSlotCta'
import { SponzoriHeader } from '@/landing/sponzori/SponzoriHeader'

export const revalidate = 600

const PARTNER_FORMS: [string, string, string] = ['partner', 'partneři', 'partnerů']

/**
 * Partneři klubu v landing designu — handoff „HC Cestice Sponzori".
 *
 * Aktivní sponzoři z kolekce `sponsors` ve výpisu pod sebou, na konci
 * tmavá karta s výzvou pro nové partnery. Kontaktní údaje jsou volitelné,
 * prázdné se nevykreslují.
 */
export default async function SponzoriPage() {
  const [sponsors, season] = await Promise.all([
    fetchSponsors(),
    fetchSeason(null),
  ])

  const seasonLabel = season ? seasonShortLabel(season) : null
  const count = countLabel(sponsors.length, PARTNER_FORMS)

  return (
    <SubpageShell>
<SponzoriHeader
        count={seasonLabel ? `${count} v sezóně ${seasonLabel}` : count}
        seasonLabel={seasonLabel}
      />

      <SectionShell spacing="content">
        <GlowCircle className="top-25 -left-50 size-140" tone="lime" />

        <Reveal>
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-3">
            {sponsors.map((sponsor) => (
              <PartnerRow key={sponsor.id} sponsor={sponsor} />
            ))}
            <PartnerSlotCta />
          </div>
        </Reveal>
      </SectionShell>
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Partneři | HC Čestice',
  description:
    'Firmy a lidé z okolí, kteří drží vesnický hokej v Česticích nad vodou — partneři a sponzoři HC Čestice.',
  alternates: { canonical: '/sponzori' },
}
