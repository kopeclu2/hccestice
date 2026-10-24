import type { Block } from 'payload'

import { matchField } from '@/landing/blocks/shared'

export const MatchTimelineWidget: Block = {
  slug: 'matchTimeline',
  interfaceName: 'MatchTimelineBlock',
  labels: { singular: 'Zápas — Průběh zápasu', plural: 'Zápas — Průběh zápasu' },
  fields: [matchField],
}
