import type { Block } from 'payload'

import { photoField } from '../shared'

export const LandingClub: Block = {
  slug: 'landingClub',
  interfaceName: 'LandingClubBlock',
  labels: { singular: 'Landing — O klubu', plural: 'Landing — O klubu' },
  fields: [
    { name: 'kicker', type: 'text', label: 'Štítek nad nadpisem' },
    {
      type: 'row',
      fields: [
        { name: 'headlineStart', type: 'text', label: 'Nadpis — začátek' },
        { name: 'headlineHighlight', type: 'text', label: 'Zvýrazněný konec' },
      ],
    },
    { name: 'perex', type: 'textarea', label: 'Perex' },
    { name: 'ctaLabel', type: 'text', label: 'Text CTA tlačítka' },
    {
      name: 'stadium',
      type: 'group',
      label: 'Karta — domácí led',
      fields: [
        photoField('photo'),
        { name: 'tag', type: 'text', label: 'Štítek' },
        { name: 'caption', type: 'text', label: 'Popisek' },
      ],
    },
    {
      name: 'youth',
      type: 'group',
      label: 'Karta — mládež',
      fields: [
        photoField('photo'),
        { name: 'tag', type: 'text', label: 'Štítek' },
        { name: 'caption', type: 'text', label: 'Popisek' },
      ],
    },
    { name: 'note', type: 'textarea', label: 'Doplňkový text pod kartou' },
  ],
}
