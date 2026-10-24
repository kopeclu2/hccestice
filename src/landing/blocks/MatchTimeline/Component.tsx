import React, { useId } from 'react'

import { MatchTimeline } from '@/landing/features/matches/components/MatchTimeline'
import { fetchMatchDetailByRef } from '@/landing/features/matches/data/matchDetail'
import type { MatchTimelineBlock } from '@/payload-types'

/**
 * Průběh zápasu po třetinách (branky obou týmů a naše tresty) — tatáž osa
 * jako na `/zapasy/[slug]`. Zápas bez zápisu `null`.
 */
export async function MatchTimelineBlockComponent({ block }: { block: MatchTimelineBlock }) {
  const match = await fetchMatchDetailByRef(block.match)
  if (!match || match.timeline.length === 0) return null
  return (
    <TimelineView
      goalsOurs={match.goalsOurs}
      opponentName={match.weAreHome ? match.awayName : match.homeName}
      penaltyMinutes={match.penaltyMinutes}
      periods={match.timeline}
    />
  )
}

/** Vlastní komponenta jen kvůli `useId` — async server komponenta hook volat nemá. */
function TimelineView(props: Omit<React.ComponentProps<typeof MatchTimeline>, 'id' | 'titleAs'>) {
  return <MatchTimeline id={useId()} titleAs="h3" {...props} />
}
