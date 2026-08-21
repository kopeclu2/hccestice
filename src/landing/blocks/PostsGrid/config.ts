import type { Block } from 'payload'

import { limitField, seasonFilter } from '../shared'

export const PostsGridWidget: Block = {
  slug: 'postsGrid',
  interfaceName: 'PostsGridBlock',
  labels: { singular: 'Widget — Články', plural: 'Widgety — Články' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'postType',
      type: 'select',
      label: 'Typ článků',
      defaultValue: 'all',
      options: [
        { label: 'Všechny', value: 'all' },
        { label: 'Novinky', value: 'news' },
        { label: 'Reportáže ze zápasů', value: 'report' },
      ],
    },
    { type: 'row', fields: [seasonFilter, limitField(6, 12)] },
    {
      name: 'showPhoto',
      type: 'checkbox',
      label: 'Zobrazit fotku u článku',
      defaultValue: false,
      admin: {
        description:
          'Náhledová fotka vlevo na kartě. Články bez vlastní fotky použijí výchozí obrázek z Nastavení webu.',
      },
    },
  ],
}
