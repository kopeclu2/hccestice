import type { Block } from 'payload'

export const RawHtml: Block = {
  slug: 'rawHtml',
  interfaceName: 'RawHtmlBlock',
  labels: {
    singular: 'HTML blok (legacy)',
    plural: 'HTML bloky (legacy)',
  },
  fields: [
    {
      name: 'html',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Původní HTML obsah importovaný z eStránky. Postupně převádět na strukturované bloky.',
      },
    },
  ],
}
