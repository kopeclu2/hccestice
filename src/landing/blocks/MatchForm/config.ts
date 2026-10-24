import type { Block } from 'payload'

import { seasonFilter } from '@/landing/blocks/shared'

export const MatchFormWidget: Block = {
  slug: 'matchForm',
  interfaceName: 'MatchFormBlock',
  labels: { singular: 'Zápasy — Forma týmu', plural: 'Zápasy — Forma týmu' },
  fields: [seasonFilter],
}
