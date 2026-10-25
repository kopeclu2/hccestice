import type { Metadata } from 'next'
import React from 'react'

import { TrainingsTable } from '@/landing/features/trainings/components/TrainingsTable'
import type { TrainingSession } from '@/landing/features/trainings/view/trainingsTable'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { PageTitle, SectionTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { brandTitle } from '@/lib/brandTitle'

export const metadata: Metadata = {
  title: brandTitle('Náhled: tabulka tréninků'),
  robots: { index: false, follow: false },
}

const VENUE = 'ZS Rychnov nad Kněžnou'

/** Ukázkové termíny — záměrně neseřazené, tabulka je řadí sama. */
const SAMPLE: TrainingSession[] = [
  s('5', '2026-11-05T17:45:00+01:00', '2026-11-05T19:00:00+01:00', 'Muži'),
  s('3', '2026-11-03T16:00:00+01:00', '2026-11-03T17:15:00+01:00', 'Muži + děti'),
  s('10', '2026-11-10T16:00:00+01:00', '2026-11-10T17:15:00+01:00', 'Muži + děti'),
  s('12', '2026-11-12T17:45:00+01:00', '2026-11-12T19:00:00+01:00', 'Muži', 'Bez brankáře'),
  s('17', '2026-11-17T16:00:00+01:00', '2026-11-17T17:15:00+01:00', 'Muži + děti'),
  s('21', '2026-11-21T09:00:00+01:00', '2026-11-21T11:00:00+01:00', 'Společný', 'Turnaj', true),
  s('1', '2026-12-01T16:00:00+01:00', '2026-12-01T17:15:00+01:00', 'Muži + děti'),
  s('3d', '2026-12-03T17:45:00+01:00', null, 'Muži', 'Čas upřesníme'),
]

function s(
  id: string,
  startsAt: string,
  endsAt: string | null,
  group: string,
  note: string | null = null,
  accent = false,
): TrainingSession {
  return { id, startsAt, endsAt, group, venue: VENUE, note, accent }
}

/**
 * Interní náhled tabulky tréninků nad ukázkovými daty (bez databáze).
 * Sourozenec `/vzory/prazdne-stavy`; po schválení vzhledu se komponenta
 * napojí na kolekci `trainings`.
 */
export default function TrainingsPreviewPage() {
  return (
    <SubpageShell hatch={false} surface="paper">
      <header className="mx-auto max-w-page px-gutter pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Tabulka tréninků
        </PageTitle>
      </header>

      <SectionShell spacing="section">
        <SectionTitle>S termíny</SectionTitle>
        <div className="mt-8">
          <TrainingsTable sessions={SAMPLE} />
        </div>
      </SectionShell>

      <SectionShell spacing="section">
        <SectionTitle>Bez termínů</SectionTitle>
        <div className="mt-8">
          <TrainingsTable sessions={[]} />
        </div>
      </SectionShell>
    </SubpageShell>
  )
}
