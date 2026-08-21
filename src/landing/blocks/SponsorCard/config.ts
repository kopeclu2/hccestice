import type { Block } from 'payload'

export const SponsorCardWidget: Block = {
  slug: 'sponsorCard',
  interfaceName: 'SponsorCardBlock',
  labels: { singular: 'Widget — Karta sponzora', plural: 'Widgety — Karta sponzora' },
  fields: [
    {
      name: 'sponsor',
      type: 'relationship',
      relationTo: 'sponsors',
      required: true,
      label: 'Sponzor',
    },
    { name: 'kicker', type: 'text', label: 'Štítek (např. „Partner klubu")' },
    { name: 'note', type: 'textarea', label: 'Text poděkování / popis' },
  ],
}
