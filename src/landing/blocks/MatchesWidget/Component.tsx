import React from 'react'

import { relId } from '@/landing/data/format'
import { MatchesWidgetView } from '@/landing/features/matches/components/MatchesWidgetView'
import { fetchMatchRows } from '@/landing/features/matches/data/matches'
import type { MatchesWidgetBlock } from '@/payload-types'

/** Widget zápasů — načte řádky z kolekce dle filtrů bloku. */
export async function MatchesWidgetBlockComponent({ block }: { block: MatchesWidgetBlock }) {
  const rows = await fetchMatchRows({
    mode: block.mode,
    seasonId: relId(block.season),
    teamId: relId(block.team),
    limit: block.limit ?? 5,
  })
  return <MatchesWidgetView mode={block.mode} rows={rows} title={block.title ?? null} />
}
