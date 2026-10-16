import React from 'react'

import { RosterWidgetView } from '@/landing/features/roster/components/RosterWidgetView'
import { fetchPickedPlayers } from '@/landing/features/roster/data'
import { relId } from '@/landing/lib/payload'
import type { PlayersPickerBlock } from '@/payload-types'

/** Vybraní hráči (v tomto pořadí) — render přes mřížku soupisky. */
export async function PlayersPickerBlockComponent({ block }: { block: PlayersPickerBlock }) {
  const ids = (block.players ?? []).map(relId).filter((id): id is number => id !== null)
  if (ids.length === 0) return null
  const players = await fetchPickedPlayers(ids)
  return <RosterWidgetView players={players} title={block.title ?? null} />
}
