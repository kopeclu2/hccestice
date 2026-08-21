import type { Block } from 'payload'

export const LandingContact: Block = {
  slug: 'landingContact',
  interfaceName: 'LandingContactBlock',
  labels: { singular: 'Landing — Kontakt', plural: 'Landing — Kontakt' },
  fields: [
    { name: 'kicker', type: 'text', label: 'Štítek' },
    { name: 'perex', type: 'textarea', label: 'Perex' },
    {
      name: 'pills',
      type: 'array',
      label: 'Informační pilulky (adresa, stadion…)',
      labels: { singular: 'Pilulka', plural: 'Pilulky' },
      fields: [{ name: 'text', type: 'text', label: 'Text', required: true }],
    },
    {
      name: 'topics',
      type: 'array',
      label: 'Témata formuláře („Čeho se to týká")',
      labels: { singular: 'Téma', plural: 'Témata' },
      fields: [{ name: 'label', type: 'text', label: 'Název', required: true }],
    },
  ],
}
