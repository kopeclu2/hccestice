import type { Block } from 'payload'

export const MatchWidget: Block = {
  slug: 'matchWidget',
  interfaceName: 'MatchWidgetBlock',
  labels: {
    singular: 'Widget zápasů',
    plural: 'Widgety zápasů',
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'next',
      options: [
        { label: 'Nejbližší zápasy', value: 'next' },
        { label: 'Poslední utkání', value: 'last' },
        { label: 'Odehraná utkání', value: 'played' },
      ],
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      admin: { description: 'Volitelně omezit na tým' },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      admin: { description: 'Volitelně omezit na sezónu' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
    },
  ],
}
