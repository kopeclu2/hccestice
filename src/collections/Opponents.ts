import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Opponents: CollectionConfig = {
  slug: 'opponents',
  labels: {
    singular: 'Soupeř',
    plural: 'Soupeři',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Hokej',
    useAsTitle: 'name',
    defaultColumns: ['name', 'city'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Např. „HC Skuteč"' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'city',
      type: 'text',
    },
    slugField({ useAsSlug: 'name' }),
  ],
}
