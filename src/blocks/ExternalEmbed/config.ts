import type { Block } from 'payload'

export const ExternalEmbed: Block = {
  slug: 'externalEmbed',
  interfaceName: 'ExternalEmbedBlock',
  labels: {
    singular: 'Externí vložení (iframe)',
    plural: 'Externí vložení (iframe)',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'URL vkládané stránky (např. ligová tabulka)' },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
    },
  ],
}
