import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

export const Players: CollectionConfig = {
  slug: 'players',
  labels: {
    singular: 'Hráč',
    plural: 'Hráči',
  },
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
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
    defaultColumns: ['name', 'number', 'position', 'active'],
    description: 'Soupiska se skládá z hráčů označených jako „Aktivní hráč".',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Jméno a příjmení, např. „Lukáš Sajdl"' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'number',
          type: 'number',
          label: 'Číslo dresu',
          min: 1,
          max: 99,
        },
        {
          name: 'position',
          type: 'select',
          label: 'Post',
          options: [
            { label: 'Brankář', value: 'G' },
            { label: 'Obránce', value: 'D' },
            { label: 'Útočník', value: 'F' },
          ],
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktivní hráč',
      defaultValue: true,
      admin: { description: 'Neaktivní hráči se nezobrazují na soupisce.' },
    },
  ],
}
