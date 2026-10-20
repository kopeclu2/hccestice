import type { Block } from 'payload'

import { embedUrlValidator } from '@/lib/embedHosts'

export const ExternalEmbedWidget: Block = {
  slug: 'externalEmbed',
  interfaceName: 'ExternalEmbedBlock',
  labels: { singular: 'Widget — Externí obsah (iframe)', plural: 'Widgety — Externí obsah' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: embedUrlValidator({ required: true }),
      label: 'URL vkládané stránky',
      admin: { description: 'Např. FB feed plugin, tabulka na ahl.cz…' },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Výška (px)',
      defaultValue: 600,
      min: 200,
      max: 1600,
    },
  ],
}
