import type { Block } from 'payload'

import { sanitizeHtmlFieldHook } from '@/hooks/sanitizeHtml'

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
      // Stored XSS: čistí se při uložení, na renderu ještě jednou (viz hooks/sanitizeHtml).
      hooks: { beforeChange: [sanitizeHtmlFieldHook] },
      admin: {
        language: 'html',
        description:
          'Původní HTML obsah importovaný z eStránky. Postupně převádět na strukturované bloky. Při uložení se odstraní skripty, události (onclick…), formuláře a cizí iframy.',
      },
    },
  ],
}
