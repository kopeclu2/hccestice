import type { Block } from 'payload'


export const StandingsWidget: Block = {
  slug: 'standingsWidget',
  interfaceName: 'StandingsWidgetBlock',
  labels: { singular: 'Widget — Tabulka ligy', plural: 'Widgety — Tabulka' },
  fields: [
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      label: 'Sezóna',
      admin: {
        description:
          'Tabulka se čte z dokumentu sezóny (Sezóny → Tabulka ligy). Prázdné = aktuální sezóna.',
      },
    },
  ],
}
