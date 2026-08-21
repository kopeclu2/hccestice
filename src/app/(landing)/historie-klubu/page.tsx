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
    <SubpageShell>
<HistorieHeader />

      <SectionShell className="max-w-[77.5rem] space-y-18" spacing="content">
        {eras.map((era) => (
          <EraSection era={era} key={era.value} />
        ))}

        <StoryPanel />
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
