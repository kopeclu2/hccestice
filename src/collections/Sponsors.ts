import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  labels: {
    singular: 'Sponzor',
    plural: 'Sponzoři',
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
    defaultColumns: ['name', 'active', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Web sponzora (volitelné)' },
    },
    // Kontakty pro výpis na /sponzori — prázdné údaje se nevykreslují.
    {
      name: 'person',
      type: 'text',
      label: 'Kontaktní osoba',
      admin: { description: 'Volitelné — zobrazí se pod názvem partnera' },
    },
    {
      name: 'address',
      type: 'text',
      label: 'Adresa',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mail',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Aktivní (zobrazovat)',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
