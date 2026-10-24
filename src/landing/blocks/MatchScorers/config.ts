import type { Block } from 'payload'

import { matchField, matchTitleField } from '@/landing/blocks/shared'

export const MatchScorersWidget: Block = {
  slug: 'matchScorers',
  interfaceName: 'MatchScorersBlock',
  labels: { singular: 'Zápas — Střelci', plural: 'Zápas — Střelci' },
  fields: [matchField, matchTitleField('Střelci')],
}
