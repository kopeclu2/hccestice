import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Teams: CollectionConfig = {
  slug: 'teams',
  labels: {
    singular: 'Tým',
    plural: 'Týmy',
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
    defaultColumns: ['name', 'category', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Muži, Přípravka, Žáci, Dorost…' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'men',
      options: [
        { label: 'Muži', value: 'men' },
        { label: 'Mládež', value: 'youth' },
        { label: 'Přípravka', value: 'prep' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Pořadí v menu/výpisech' },
    },
    slugField({ useAsSlug: 'name' }),
  ],
}
