import type { CollectionConfig } from 'payload'

import { slugFieldCs } from '@/fields/slugCs'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

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
    // Výchozí slugify Payloadu zahazuje písmena s diakritikou (`HC Žďár` →
    // `hc-r`), proto vlastní. Slug soupeře je součástí adresy zápasu.
    slugFieldCs({ useAsSlug: 'name' }),
  ],
  hooks: {
    // Název a logo soupeře jsou na detailu zápasu i ve výpisech. Synchronizace
    // zapisuje s `context.disableRevalidate` (`sync/ctx.ts`) a revaliduje sama
    // jednou na konci běhu.
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
