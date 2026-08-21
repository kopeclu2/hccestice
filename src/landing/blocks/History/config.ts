import type { Block } from 'payload'

export const LandingHistory: Block = {
  slug: 'landingHistory',
  interfaceName: 'LandingHistoryBlock',
  labels: { singular: 'Landing — Historie', plural: 'Landing — Historie' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'kicker', type: 'text', label: 'Štítek' },
        { name: 'watermark', type: 'text', label: 'Watermark (např. 1954)' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'headlineStart', type: 'text', label: 'Nadpis — začátek' },
        {
          name: 'headlineHighlight',
          type: 'text',
          label: 'Zvýrazněný konec',
          admin: { description: 'Konec nadpisu na lime podkladu; tečku doplní web.' },
        },
      ],
    },
    {
      name: 'lead',
      type: 'textarea',
      label: 'Vyprávění — první odstavec',
      admin: { description: 'Větší text vlevo (jak klub vznikl).' },
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Vyprávění — druhý odstavec',
      admin: { description: 'Menší text pod ním (kde jsme dnes).' },
    },
    {
      name: 'metaLine',
      type: 'text',
      label: 'Šedý text vedle tlačítek',
      admin: { description: 'Např. „založeno 1954 · od dresů na dluh k bronzu 2026".' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Tlačítko na historii klubu',
          admin: { description: 'Odkazuje na /historie-klubu.' },
        },
        {
          name: 'photosCtaLabel',
          type: 'text',
          label: 'Tlačítko na fotky',
          admin: { description: 'Odkazuje na /fotogalerie.' },
        },
      ],
    },
    {
      name: 'chips',
      type: 'array',
      label: 'Pilulky milníků',
      labels: { singular: 'Pilulka', plural: 'Pilulky' },
      admin: { description: 'Krátké milníky pod vyprávěním, např. „2015 · VČHL".' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Text', required: true },
            { name: 'accent', type: 'checkbox', label: 'Zvýraznit (lime pilulka)' },
          ],
        },
      ],
    },
    {
      name: 'quote',
      type: 'group',
      label: 'Citát z kroniky',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'start', type: 'text', label: 'Citát — začátek' },
            {
              name: 'highlight',
              type: 'text',
              label: 'Zvýrazněná část',
              admin: { description: 'Část citátu na lime podkladu.' },
            },
          ],
        },
        {
          name: 'end',
          type: 'text',
          label: 'Citát — zbytek',
          admin: { description: 'Pokračování za zvýrazněním, včetně interpunkce.' },
        },
        { name: 'source', type: 'text', label: 'Zdroj citátu' },
      ],
    },
  ],
}
