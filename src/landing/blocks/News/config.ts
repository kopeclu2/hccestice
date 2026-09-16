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
          defaultValue: 5,
          min: 3,
          max: 5,
          admin: {
            description: 'Sekce je výřez — plný výpis je na /aktuality.',
          },
        },
      ],
    },
    {
      name: 'showPhoto',
      type: 'checkbox',
      label: 'Doplnit výchozí obrázek článkům bez fotky',
      defaultValue: false,
      admin: {
        description:
          'Náhled má karta vždy — článek bez vlastní fotky dostane vzorovou plochu. S touhle volbou se místo ní použije Výchozí obrázek článků z Nastavení webu.',
      },
    },
  ],
}
