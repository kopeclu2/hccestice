import type { Metadata } from 'next'

import React from 'react'

import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchHistoryEras } from '@/landing/data/history'
import { ArchiveCta } from '@/landing/historie/ArchiveCta'
import { EraSection } from '@/landing/historie/EraSection'
import { HistorieHeader } from '@/landing/historie/HistorieHeader'
import { StoryPanel } from '@/landing/historie/StoryPanel'

export const revalidate = 600

/**
 * Historie klubu v landing designu — handoff „HC Cestice Historie".
 *
 * Editorial timeline: éry z `HISTORY_PAGE.eras`, milníky z kolekce
 * `milestones` (fallback na obsah handoffu), pod nimi příběh o dresech
 * na dluh a odkaz do fotoalba.
 */
export default async function HistorieKlubuPage() {
  const eras = await fetchHistoryEras()

  return (
    <SubpageShell pattern={{ variant: 'cross', tone: 'club', fade: 'center' }}>
      <HistorieHeader />

      {/* Šířku timeline drží vnitřní obal, ne `SectionShell`. Override
          `max-w` na shellu se totiž potkal s jeho `mx-auto`, takže se obsah
          od 1240px vycentroval uvnitř širší hlavičky (`max-w-[97.5rem]`)
          a odsadil se ~80px vpravo od `<h1>`. */}
      <SectionShell spacing="content">
        <div className="max-w-[77.5rem] space-y-12 md:space-y-15 lg:space-y-18">
          {eras.map((era) => (
            <EraSection era={era} key={era.value} />
          ))}

          <StoryPanel />
        </div>
      </SectionShell>

      <ArchiveCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Historie klubu | HC Čestice',
  description:
    'Sedmdesát let hokeje v Česticích — od kluziště za Machačovými a dresů na dluh po historický bronz ve Východočeské hokejové lize.',
  alternates: { canonical: '/historie-klubu' },
}
