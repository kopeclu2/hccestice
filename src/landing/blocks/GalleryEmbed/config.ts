import type { Block } from 'payload'

import { limitField } from '../shared'

export const GalleryEmbedWidget: Block = {
  slug: 'galleryEmbed',
  interfaceName: 'GalleryEmbedBlock',
  labels: { singular: 'Widget — Vložená galerie', plural: 'Widgety — Vložená galerie' },
  fields: [
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      required: true,
      label: 'Galerie',
    },
    { name: 'title', type: 'text', label: 'Nadpis (prázdné = název galerie)' },
    limitField(8, 24),
  ],
}
