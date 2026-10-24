import type { Block } from 'payload'

import { matchField, matchTitleField } from '@/landing/blocks/shared'

export const MatchLineupWidget: Block = {
  slug: 'matchLineup',
  interfaceName: 'MatchLineupBlock',
  labels: { singular: 'Zápas — Soupiska', plural: 'Zápas — Soupiska' },
  fields: [matchField, matchTitleField('Soupiska')],
}
