import React from 'react'

import { MatchScoreboardPanel } from '@/landing/features/matches/components/MatchScoreboardPanel'
import { fetchMatchDetailByRef } from '@/landing/features/matches/data/matchDetail'
import type { MatchScoreboardBlock } from '@/payload-types'

/**
 * Tabule se skóre, třetinami a stavem zápasu. Naplánovaný ani zrušený zápas
 * skóre nemá, takže se nevykreslí nic (pro naplánovaný zápas je tu blok
 * Nejbližší zápas).
 */
export async function MatchScoreboardBlockComponent({ block }: { block: MatchScoreboardBlock }) {
  const match = await fetchMatchDetailByRef(block.match)
  if (!match) return null
  return <MatchScoreboardPanel match={match} />
}
