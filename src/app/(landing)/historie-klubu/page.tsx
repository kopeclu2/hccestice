import type { Metadata } from 'next'
import React from 'react'

import { ArchiveCta } from '@/landing/features/history/components/ArchiveCta'
import { EraSection } from '@/landing/features/history/components/EraSection'
import { HistoryHeader } from '@/landing/features/history/components/HistoryHeader'
import { StoryPanel } from '@/landing/features/history/components/StoryPanel'
import { fetchHistoryEras } from '@/landing/features/history/data'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { SectionShell } from '@/landing/ui/SectionShell'
import { buildPageMetadata } from '@/lib/buildPageMetadata'

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
      <HistoryHeader />

      {/* Šířku timeline drží vnitřní obal, ne `SectionShell`. Override
          `max-w` na shellu se totiž potkal s jeho `mx-auto`, takže se obsah
          od 1240px vycentroval uvnitř širší hlavičky (`max-w-page`)
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

export const metadata: Metadata = buildPageMetadata({
  title: 'Historie klubu',
  description:
    'Sedmdesát let hokeje v Česticích — od kluziště za Machačovými a dresů na dluh po historický bronz ve Východočeské hokejové lize.',
  path: '/historie-klubu',
})
