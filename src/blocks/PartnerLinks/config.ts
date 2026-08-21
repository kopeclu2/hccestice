import type { Block } from 'payload'

export const PartnerLinks: Block = {
  slug: 'partnerLinks',
  interfaceName: 'PartnerLinksBlock',
  labels: {
    singular: 'Odkazy na partnery',
    plural: 'Odkazy na partnery',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Weby',
    },
    {
      name: 'links',
      type: 'array',
      labels: { singular: 'Odkaz', plural: 'Odkazy' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
