import type { Block } from 'payload'

export const NextMatchWidget: Block = {
  slug: 'nextMatchWidget',
  interfaceName: 'NextMatchWidgetBlock',
  labels: { singular: 'Widget — Nejbližší zápas (countdown)', plural: 'Widgety — Nejbližší zápas' },
  fields: [
    {
      name: 'note',
      type: 'text',
      label: 'Text, když žádný zápas není naplánovaný',
      admin: { description: 'Např. „Rozpis nové sezóny připravujeme."' },
    },
  ],
}
