import type { Block } from 'payload'

import { limitField, seasonFilter, teamFilter } from '../shared'

export const MatchesWidget: Block = {
  slug: 'matchesWidget',
  interfaceName: 'MatchesWidgetBlock',
  labels: { singular: 'Widget — Zápasy', plural: 'Widgety — Zápasy' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis karty' },
    {
      name: 'mode',
      type: 'select',
      label: 'Režim',
      defaultValue: 'results',
      required: true,
      options: [
        { label: 'Výsledky (odehrané)', value: 'results' },
        { label: 'Rozpis (nadcházející)', value: 'schedule' },
      ],
    },
    { type: 'row', fields: [seasonFilter, teamFilter, limitField(5)] },
  ],
}
