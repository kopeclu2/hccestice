import type { Block } from 'payload'

export const MatchesPickerWidget: Block = {
  slug: 'matchesPicker',
  interfaceName: 'MatchesPickerBlock',
  labels: { singular: 'Widget — Vybrané zápasy', plural: 'Widgety — Vybrané zápasy' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis karty' },
    {
      name: 'matches',
      type: 'relationship',
      relationTo: 'matches',
      hasMany: true,
      required: true,
      label: 'Zápasy (v tomto pořadí)',
    },
  ],
}
