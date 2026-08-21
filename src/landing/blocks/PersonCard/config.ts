import type { Block } from 'payload'

export const PersonCardWidget: Block = {
  slug: 'personCard',
  interfaceName: 'PersonCardBlock',
  labels: { singular: 'Widget — Karta osoby (kontakt)', plural: 'Widgety — Karta osoby' },
  fields: [
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'people',
      required: true,
      label: 'Osoba',
    },
  ],
}
