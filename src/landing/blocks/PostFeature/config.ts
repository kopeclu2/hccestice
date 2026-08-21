import type { Block } from 'payload'

import { photoField } from '../shared'

export const PostFeatureWidget: Block = {
  slug: 'postFeature',
  interfaceName: 'PostFeatureBlock',
  labels: { singular: 'Widget — Vypíchnutý článek', plural: 'Widgety — Vypíchnutý článek' },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: 'Článek',
    },
    photoField('fallbackPhoto', 'Náhradní fotka (když článek nemá vlastní obrázek)'),
    { name: 'tag', type: 'text', label: 'Štítek (prázdné = podle typu článku)' },
  ],
}
