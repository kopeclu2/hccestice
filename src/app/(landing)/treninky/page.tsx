import type { Metadata } from 'next'
import React from 'react'

import { TrainingsBlockComponent } from '@/landing/blocks/Trainings/Component'
import { TrainingsHeader } from '@/landing/features/trainings/components/TrainingsHeader'
import { fetchTrainingsBlock } from '@/landing/features/trainings/data'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { buildPageMetadata } from '@/lib/buildPageMetadata'

export const revalidate = 600

/**
 * Tréninky jako samostatná stránka — stejná sekce jako na homepage (blok
 * `landingTrainings` pro texty, termíny z kolekce `trainings`), jen s vlastní
 * hlavičkou a URL pro odkazování a SEO. Bez bloku na homepage (odstraněný
 * nebo smazaný) se vykreslí texty z `content.ts` — viz `mapTrainings`.
 */
export default async function TreninkyPage() {
  const block = await fetchTrainingsBlock()

  return (
    <SubpageShell>
      <TrainingsHeader />
      <TrainingsBlockComponent
        block={block ?? { blockType: 'landingTrainings' }}
        spacing="content"
      />
    </SubpageShell>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Tréninky',
  description:
    'Rozpis ledových hodin HC Čestice — kdy a kde trénují muži a mládež na zimním stadionu.',
  path: '/treninky',
})
