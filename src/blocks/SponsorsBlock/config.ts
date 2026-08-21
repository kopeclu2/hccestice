import type { Block } from 'payload'

export const SponsorsBlock: Block = {
  slug: 'sponsorsBlock',
  interfaceName: 'SponsorsBlock',
  labels: {
    singular: 'Sponzoři',
    plural: 'Sponzoři',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Sponzoři',
    },
  ],
}
