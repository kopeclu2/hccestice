import type { Block } from 'payload'


export const PlayersPickerWidget: Block = {
  slug: 'playersPicker',
  interfaceName: 'PlayersPickerBlock',
  labels: { singular: 'Widget — Vybraní hráči', plural: 'Widgety — Vybraní hráči' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'players',
      type: 'relationship',
      relationTo: 'players',
      hasMany: true,
      required: true,
      label: 'Hráči (v tomto pořadí)',
    },
  ],
}
