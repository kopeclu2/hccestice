import type { Block } from 'payload'

export const StandingsTable: Block = {
  slug: 'standingsTable',
  interfaceName: 'StandingsTableBlock',
  labels: {
    singular: 'Tabulka soutěže',
    plural: 'Tabulky soutěže',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Např. „Tabulka VČLH 2025-2026 Zákl. část"' },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
    },
    {
      name: 'rows',
      type: 'array',
      labels: { singular: 'Řádek', plural: 'Řádky' },
      admin: { description: 'Ručně udržovaná ligová tabulka (obsahuje všechny týmy ligy).' },
      fields: [
        { name: 'rank', type: 'number', label: 'Pořadí' },
        { name: 'team', type: 'text', required: true, label: 'Tým' },
        { name: 'gp', type: 'number', label: 'Zápasy' },
        { name: 'w', type: 'number', label: 'Výhry' },
        { name: 'otw', type: 'number', label: 'Výhry v prodl.' },
        { name: 'otl', type: 'number', label: 'Prohry v prodl.' },
        { name: 'l', type: 'number', label: 'Prohry' },
        { name: 'gf', type: 'number', label: 'Vstřelené góly' },
        { name: 'ga', type: 'number', label: 'Obdržené góly' },
        { name: 'pts', type: 'number', label: 'Body' },
      ],
    },
  ],
}
