import React from 'react'

import { FormStrip } from '@/landing/features/matches/components/FormStrip'
import { fetchSeasonForm } from '@/landing/features/matches/data/matches'
import { fetchSeason } from '@/landing/features/matches/data/seasons'
import { relId } from '@/landing/lib/payload'
import type { MatchFormBlock } from '@/payload-types'

/**
 * Forma HC Čestice — posledních pět odehraných zápasů sezóny jako čtverečky
 * V / R / P. Prázdná sezóna = aktuální; sezóna bez odehraného zápasu `null`.
 */
export async function MatchFormBlockComponent({ block }: { block: MatchFormBlock }) {
  const seasonId = relId(block.season) ?? (await fetchSeason(null))?.id
  if (!seasonId) return null
  const form = await fetchSeasonForm(seasonId)
  if (!form) return null
  return <FormStrip form={form} />
}
