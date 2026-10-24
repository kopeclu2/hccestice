import React, { useId } from 'react'

import { MatchLineup } from '@/landing/features/matches/components/MatchLineup'
import { fetchMatchSlugById } from '@/landing/features/matches/data/matchDetail'
import { fetchMatchLineup } from '@/landing/features/matches/data/matchLineup'
import { relId } from '@/landing/lib/payload'
import type { MatchLineupBlock } from '@/payload-types'

/**
 * Soupiska HC Čestice ze zápisu o utkání. Čte vlastní lehký fetcher
 * (`fetchMatchLineup`), ne detail zápasu — ten sestavu záměrně nenese.
 * Zápas bez adresy se jako u ostatních widgetů nezobrazí.
 */
export async function MatchLineupBlockComponent({ block }: { block: MatchLineupBlock }) {
  const matchId = relId(block.match)
  if (!matchId) return null
  const [slug, lineup] = await Promise.all([fetchMatchSlugById(matchId), fetchMatchLineup(matchId)])
  if (!slug || !lineup) return null
  return <LineupView lineup={lineup} title={block.title || 'Soupiska'} />
}

/** Vlastní komponenta jen kvůli `useId` — async server komponenta hook volat nemá. */
function LineupView(props: Omit<React.ComponentProps<typeof MatchLineup>, 'id'>) {
  return <MatchLineup id={useId()} {...props} />
}
