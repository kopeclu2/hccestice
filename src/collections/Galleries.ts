import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
  revalidateGalleryFeeds,
  revalidateGalleryFeedsDelete,
} from '../hooks/revalidateGalleryFeeds'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: {
    singular: 'Fotoalbum',
    plural: 'Fotoalba',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Obsah',
    useAsTitle: 'title',
    defaultColumns: ['title', 'season', 'team', 'date'],
  },
  defaultSort: '-date',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      index: true,
      admin: { description: 'Datum události (zápas/turnaj)' },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      index: true,
      admin: { description: 'Prázdné u tematických alb (Zimní stadion, Historie…)' },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      index: true,
    },
    {
      name: 'group',
      type: 'select',
      defaultValue: 'season',
      options: [
        { label: 'Sezónní album', value: 'season' },
        { label: 'Tematické album', value: 'theme' },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Úvodní fotka',
    },
    {
      name: 'photos',
      type: 'array',
      labels: { singular: 'Fotka', plural: 'Fotky' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'legacyDir',
      type: 'number',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'p_directories.id z eStránky (pro import/redirecty)',
        readOnly: true,
      },
    },
    {
      name: 'legacyPath',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Původní /fotoalbum/... cesta',
        readOnly: true,
      },
    },
    slugField(),
  ],
  hooks: {
    // /fotogalerie ani home blok Fotoalbum nemají ISR — viz Matches.
    // `revalidateGalleryFeeds` k tomu invaliduje `gallery-sitemap.xml`
    // a `/llms.txt`, kde detaily albumů taky figurují.
    afterChange: [revalidateLanding, revalidateGalleryFeeds],
    afterDelete: [revalidateLandingDelete, revalidateGalleryFeedsDelete],
  },
}
