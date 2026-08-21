import type { Block } from 'payload'

export const RosterWidget: Block = {
  slug: 'rosterWidget',
  interfaceName: 'RosterWidgetBlock',
  labels: { singular: 'Widget — Soupiska hráčů', plural: 'Widgety — Soupiska' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Nadpis',
      admin: { description: 'Zobrazí se všichni aktivní hráči.' },
    },
  ],
}
