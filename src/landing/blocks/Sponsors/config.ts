import type { Block } from 'payload'

export const LandingSponsors: Block = {
  slug: 'landingSponsors',
  interfaceName: 'LandingSponsorsBlock',
  labels: { singular: 'Landing — Partneři (marquee)', plural: 'Landing — Partneři (marquee)' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Nadpis',
      admin: { description: 'Loga se berou automaticky z kolekce Sponzoři (aktivní).' },
    },
    {
      name: 'titleHighlight',
      type: 'text',
      label: 'Nadpis — zvýrazněná část',
      admin: {
        description:
          'Konec nadpisu na lime podkladu (jako v sekci O klubu). Prázdné = zvýrazní se poslední dvě slova nadpisu.',
      },
    },
    { name: 'ctaLabel', type: 'text', label: 'Text CTA tlačítka' },
  ],
}
