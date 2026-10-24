import type { Block } from 'payload'

import { matchField, matchTitleField } from '@/landing/blocks/shared'

export const MatchPenaltiesWidget: Block = {
  slug: 'matchPenalties',
  interfaceName: 'MatchPenaltiesBlock',
  labels: { singular: 'Zápas — Tresty', plural: 'Zápas — Tresty' },
  fields: [matchField, matchTitleField('Tresty')],
}
