import type { StandingsWidgetBlock } from '@/payload-types'

import React from 'react'

import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchSeason, mapStandingsFromSeason } from '../../data/seasons'
import type { StandingsContent } from '../../types'
import { StandingsCard } from '../Season/Component'

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
