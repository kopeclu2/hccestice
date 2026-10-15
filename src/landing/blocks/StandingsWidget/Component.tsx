import React from 'react'

import { relId } from '@/landing/data/format'
import { StandingsCard } from '@/landing/features/matches/components/StandingsCard'
import { fetchSeason, mapStandingsFromSeason } from '@/landing/features/matches/data/seasons'
import type { StandingsContent } from '@/landing/features/matches/types'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { StandingsWidgetBlock } from '@/payload-types'

/** Widget tabulky ligy — načte tabulku z dokumentu sezóny. */
export async function StandingsWidgetBlockComponent({ block }: { block: StandingsWidgetBlock }) {
  const season = await fetchSeason(relId(block.season))
  return <StandingsWidgetView standings={mapStandingsFromSeason(season)} />
}

/** Samostatná tabulka ligy (sdílí StandingsCard se sekcí Sezóna). */
function StandingsWidgetView({ standings }: { standings: StandingsContent }) {
  return (
    <SectionShell>
      <Reveal>
        <StandingsCard standings={standings} />
      </Reveal>
    </SectionShell>
  )
}
