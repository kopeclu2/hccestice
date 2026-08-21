import type { Block } from 'payload'

export const LandingStats: Block = {
  slug: 'landingStats',
  interfaceName: 'LandingStatsBlock',
  labels: { singular: 'Landing — Sezóna v číslech', plural: 'Landing — Sezóna v číslech' },
  fields: [
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      label: 'Sezóna',
      admin: { description: 'Prázdné = aktuální sezóna.' },
    },
    { name: 'seasonLabel', type: 'text', label: 'Označení sezóny (např. 2025/2026)' },
    {
      name: 'items',
      type: 'array',
      label: 'Čísla (ruční přepis)',
      labels: { singular: 'Číslo', plural: 'Čísla' },
      admin: {
        description:
          'Prázdné = čísla se spočítají automaticky (umístění a body z tabulky sezóny, série výher ze zápasů, počet hráčů ze soupisky). Vyplněná čísla mají přednost.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', label: 'Hodnota (např. 3.)', required: true },
            { name: 'label', type: 'text', label: 'Popisek', required: true },
            { name: 'accent', type: 'checkbox', label: 'Zeleně' },
          ],
        },
      ],
    },
  ],
}
