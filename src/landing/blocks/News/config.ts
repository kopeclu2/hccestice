import type { Block } from 'payload'

export const LandingNews: Block = {
  slug: 'landingNews',
  interfaceName: 'LandingNewsBlock',
  labels: { singular: 'Landing — Aktuality', plural: 'Landing — Aktuality' },
  fields: [
    {
      name: 'pinnedPost',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Připnutý článek',
      admin: {
        description:
          'Nepovinné — první karta v mřížce. Když je prázdné, ukážou se prostě nejnovější publikované články.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'count',
          type: 'number',
          label: 'Počet karet',
          defaultValue: 3,
          min: 3,
          max: 4,
          admin: {
            description: 'Sekce je výřez — plný výpis je na /aktuality.',
          },
        },
      ],
    },
    {
      name: 'showPhoto',
      type: 'checkbox',
      label: 'Zobrazit fotku u článku',
      defaultValue: false,
      admin: {
        description:
          'Náhledová fotka nad textem karty. Články bez vlastní fotky použijí výchozí obrázek z Nastavení webu.',
      },
    },
  ],
}
