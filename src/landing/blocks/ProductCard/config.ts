import type { Block } from 'payload'

export const ProductCardWidget: Block = {
  slug: 'productCard',
  interfaceName: 'ProductCardBlock',
  labels: { singular: 'Widget — Karta produktu', plural: 'Widgety — Karta produktu' },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Produkt',
    },
    { name: 'kicker', type: 'text', label: 'Štítek (např. „Novinka v nabídce")' },
  ],
}
