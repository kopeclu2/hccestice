import type { Block } from 'payload'

export const MatchCardWidget: Block = {
  slug: 'matchCard',
  interfaceName: 'MatchCardBlock',
  labels: { singular: 'Widget — Karta zápasu', plural: 'Widgety — Karta zápasu' },
  fields: [
    {
      name: 'match',
      type: 'relationship',
      relationTo: 'matches',
      required: true,
      label: 'Zápas',
    },
    { name: 'kicker', type: 'text', label: 'Štítek nad zápasem (např. „Finálový bronz")' },
  ],
}
