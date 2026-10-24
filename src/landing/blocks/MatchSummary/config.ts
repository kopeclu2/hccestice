import type { Block } from 'payload'

import { matchField } from '@/landing/blocks/shared'

export const MatchSummaryWidget: Block = {
  slug: 'matchSummary',
  interfaceName: 'MatchSummaryBlock',
  labels: { singular: 'Zápas — Souhrn', plural: 'Zápas — Souhrn' },
  fields: [matchField],
}
