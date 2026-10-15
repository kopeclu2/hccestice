import React from 'react'

import { relId } from '@/landing/data/format'
import { MatchesWidgetView } from '@/landing/features/matches/components/MatchesWidgetView'
import { fetchPickedMatchRows } from '@/landing/features/matches/data/matches'
import type { MatchesPickerBlock } from '@/payload-types'

/** Vybrané zápasy (v tomto pořadí) — render přes kartu widgetu zápasů. */
export async function MatchesPickerBlockComponent({ block }: { block: MatchesPickerBlock }) {
  const ids = (block.matches ?? []).map(relId).filter((id): id is number => id !== null)
  if (ids.length === 0) return null
  const rows = await fetchPickedMatchRows(ids)
  return <MatchesWidgetView mode="results" rows={rows} title={block.title ?? 'Zápasy'} />
}
