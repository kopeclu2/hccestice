import type { Block } from 'payload'

/** Ikony dostupné ve Feature gridu (lucide). */
const FEATURE_ICONS = [
  { label: '❄️ Vločka (led)', value: 'snowflake' },
  { label: '🏆 Pohár', value: 'trophy' },
  { label: '🥇 Medaile', value: 'medal' },
  { label: '👥 Lidé / tým', value: 'users' },
  { label: '❤️ Srdce', value: 'heart' },
  { label: '🛡️ Štít / výstroj', value: 'shield' },
  { label: '📅 Kalendář', value: 'calendar' },
  { label: '⏰ Hodiny', value: 'clock' },
  { label: '🔥 Plamen', value: 'flame' },
  { label: '🤝 Podání ruky', value: 'handshake' },
  { label: '🎓 Škola / učení', value: 'graduation-cap' },
  { label: '👛 Peněženka / cena', value: 'wallet' },
] as const

export const FeatureGridWidget: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Widget — Feature grid (Proč k nám)', plural: 'Widgety — Feature grid' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'items',
      type: 'array',
      label: 'Dlaždice',
      labels: { singular: 'Dlaždice', plural: 'Dlaždice' },
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Ikona',
              defaultValue: 'snowflake',
              options: [...FEATURE_ICONS],
            },
            { name: 'title', type: 'text', label: 'Titulek', required: true },
          ],
        },
        { name: 'text', type: 'textarea', label: 'Text', required: true },
      ],
    },
  ],
}
