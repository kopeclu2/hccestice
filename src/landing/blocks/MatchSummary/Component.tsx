import React, { useId } from 'react'

import { MatchSummary } from '@/landing/features/matches/components/MatchSummary'
import { fetchMatchDetailByRef } from '@/landing/features/matches/data/matchDetail'
import { buildMatchSummary } from '@/landing/features/matches/view/matchSummary'
import type { MatchSummaryBlock } from '@/payload-types'

/**
 * Souhrn zápasu za HC Čestice — kanadské body, góly v PP / OS a tresty po
 * hráčích (počítá se z časové osy při vykreslení). Zápas bez zápisu `null`.
 */
export async function MatchSummaryBlockComponent({ block }: { block: MatchSummaryBlock }) {
  const match = await fetchMatchDetailByRef(block.match)
  if (!match) return null
  const summary = buildMatchSummary(match.timeline)
  if (summary.points.length === 0 && summary.penalties.length === 0) return null
  return <SummaryView summary={summary} />
}

/** Vlastní komponenta jen kvůli `useId` — async server komponenta hook volat nemá. */
function SummaryView(props: Omit<React.ComponentProps<typeof MatchSummary>, 'id' | 'titleAs'>) {
  return <MatchSummary id={useId()} titleAs="h3" {...props} />
}
