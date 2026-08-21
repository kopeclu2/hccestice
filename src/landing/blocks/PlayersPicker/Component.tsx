import type { PlayersPickerBlock } from '@/payload-types'

import React from 'react'

import { relId } from '../../data/format'
import { fetchPickedPlayers } from '../../data/players'
import { RosterWidgetView } from '../RosterWidget/Component'

/** Vybraní hráči (v tomto pořadí) — render přes mřížku soupisky. */
export async function PlayersPickerBlockComponent({ block }: { block: PlayersPickerBlock }) {
  const ids = (block.players ?? []).map(relId).filter((id): id is number => id !== null)
  if (ids.length === 0) return null
  const players = await fetchPickedPlayers(ids)
  return <RosterWidgetView players={players} title={block.title ?? null} />
}
