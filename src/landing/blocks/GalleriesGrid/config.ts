import type { Block } from 'payload'

import { limitField, seasonFilter } from '../shared'

export const GalleriesGridWidget: Block = {
  slug: 'galleriesGrid',
  interfaceName: 'GalleriesGridBlock',
  labels: { singular: 'Widget — Galerie', plural: 'Widgety — Galerie' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    { type: 'row', fields: [seasonFilter, limitField(6, 12)] },
  ],
}
