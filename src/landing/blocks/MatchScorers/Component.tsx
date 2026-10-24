import React, { useId } from 'react'

import { MatchScorers } from '@/landing/features/matches/components/MatchScorers'
import { fetchMatchDetailByRef } from '@/landing/features/matches/data/matchDetail'
import { buildScorers } from '@/landing/features/matches/view/matchScorers'
import type { MatchScorersBlock } from '@/payload-types'

/** Střelci HC Čestice z jednoho zápasu — bez zápasu nebo bez branek `null`. */
export async function MatchScorersBlockComponent({ block }: { block: MatchScorersBlock }) {
  const match = await fetchMatchDetailByRef(block.match)
  if (!match) return null
  const rows = buildScorers(match.timeline)
  if (rows.length === 0) return null
  return <ScorersView rows={rows} title={block.title || 'Střelci'} />
}

/** Vlastní komponenta jen kvůli `useId` — async server komponenta hook volat nemá. */
function ScorersView(props: Omit<React.ComponentProps<typeof MatchScorers>, 'id'>) {
  return <MatchScorers id={useId()} {...props} />
}
