import type { Block } from 'payload'

export const LandingFaq: Block = {
  slug: 'landingFaq',
  interfaceName: 'LandingFaqBlock',
  labels: { singular: 'Landing — Otázky (FAQ)', plural: 'Landing — Otázky (FAQ)' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Otázky a odpovědi',
      labels: { singular: 'Otázka', plural: 'Otázky' },
      fields: [
        { name: 'question', type: 'text', label: 'Otázka', required: true },
        { name: 'answer', type: 'textarea', label: 'Odpověď', required: true },
      ],
    },
  ],
}
