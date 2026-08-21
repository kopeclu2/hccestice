import type { Block } from 'payload'

import { photoField } from '../shared'

export const TestimonialsWidget: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Widget — Ohlasy', plural: 'Widgety — Ohlasy' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'items',
      type: 'array',
      label: 'Ohlasy',
      labels: { singular: 'Ohlas', plural: 'Ohlasy' },
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', label: 'Citát', required: true },
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Jméno', required: true },
            { name: 'role', type: 'text', label: 'Role (hráč, rodič, fanoušek…)' },
          ],
        },
        photoField('photo', 'Foto (volitelné)'),
      ],
    },
  ],
}
