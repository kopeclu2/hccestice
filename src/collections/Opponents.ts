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
    {
      name: 'aliases',
      type: 'array',
      label: 'Názvy na AHL.cz',
      labels: { singular: 'Název', plural: 'Názvy' },
      admin: {
        description:
          'Krátké i plné názvy, podle kterých synchronizace soupeře pozná, např. „Pardubice", „Závodní hokejová Pardubice".',
      },
      fields: [{ name: 'name', type: 'text', label: 'Název', required: true }],
    },
    slugField({ useAsSlug: 'name' }),
  ],
}
