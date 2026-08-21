import type { Block } from 'payload'

/**
 * Statistické karty v textu článku — řádek karet s velkým číslem
 * a popiskem („31:18 · Střely na branku"), viz handoff „Co říkají čísla".
 */
export const StatCardsBlock: Block = {
  slug: 'statCards',
  interfaceName: 'StatCardsBlockType',
  labels: { singular: 'Statistické karty', plural: 'Statistické karty' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Karty',
      minRows: 1,
      maxRows: 6,
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, label: 'Hodnota', admin: { description: 'Např. „31:18", „2/3", „340".' } },
            { name: 'label', type: 'text', required: true, label: 'Popisek', admin: { description: 'Např. „Střely na branku".' } },
          ],
        },
        {
          name: 'dark',
          type: 'checkbox',
          label: 'Tmavá karta (lime číslo)',
          defaultValue: false,
        },
      ],
    },
  ],
}
