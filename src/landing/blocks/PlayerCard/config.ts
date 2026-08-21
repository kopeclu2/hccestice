import type { Block } from 'payload'


export const PlayerCardWidget: Block = {
  slug: 'playerCard',
  interfaceName: 'PlayerCardBlock',
  labels: { singular: 'Widget — Karta hráče', plural: 'Widgety — Karta hráče' },
  fields: [
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      label: 'Hráč',
    },
    { name: 'note', type: 'text', label: 'Poznámka na kartě (např. „Kapitán týmu")' },
  ],
}
