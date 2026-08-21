import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Médium',
    plural: 'Média',
  },
  admin: {
    group: 'Obsah',
  },
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'legacy',
      type: 'group',
      admin: {
        description: 'Mapování na původní eStránky zdroj (plní import, needitovat)',
      },
      fields: [
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Obrázek článku (/img/picture)', value: 'img_picture' },
            { label: 'Soubor (/file)', value: 'file' },
            { label: 'Fotka alba (p_photos)', value: 'photo' },
            { label: 'FTP (ostatní)', value: 'ftp' },
          ],
          index: true,
        },
        {
          name: 'legacyId',
          type: 'number',
          index: true,
          admin: { description: 'id v původní tabulce (s_pictures / s_files / p_photos)' },
        },
        {
          name: 'legacyPath',
          type: 'text',
          admin: { description: 'Původní cesta (např. /img/picture/3/foto.jpg)' },
        },
      ],
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
