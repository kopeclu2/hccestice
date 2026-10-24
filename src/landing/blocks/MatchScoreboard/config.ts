import type { Block } from 'payload'

import { matchField } from '@/landing/blocks/shared'

export const MatchScoreboardWidget: Block = {
  slug: 'matchScoreboard',
  interfaceName: 'MatchScoreboardBlock',
  labels: { singular: 'Zápas — Tabule se skóre', plural: 'Zápas — Tabule se skóre' },
  fields: [matchField],
}
