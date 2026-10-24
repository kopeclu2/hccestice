import React, { useId } from 'react'

import { MatchPenalties } from '@/landing/features/matches/components/MatchPenalties'
import { fetchMatchDetailByRef } from '@/landing/features/matches/data/matchDetail'
import type { MatchPenaltiesBlock } from '@/payload-types'

/** Tresty HC Čestice z jednoho zápasu — bez zápasu nebo bez trestů `null`. */
export async function MatchPenaltiesBlockComponent({ block }: { block: MatchPenaltiesBlock }) {
  const match = await fetchMatchDetailByRef(block.match)
  if (!match || match.penalties.length === 0) return null
  return (
    <PenaltiesView
      minutes={match.penaltyMinutes}
      rows={match.penalties}
      title={block.title || 'Tresty'}
    />
  )
}

/** Vlastní komponenta jen kvůli `useId` — async server komponenta hook volat nemá. */
function PenaltiesView(props: Omit<React.ComponentProps<typeof MatchPenalties>, 'id'>) {
  return <MatchPenalties id={useId()} {...props} />
}
