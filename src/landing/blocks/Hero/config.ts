import type { Block } from 'payload'

import { photoField } from '../shared'

export const LandingHero: Block = {
  slug: 'landingHero',
  interfaceName: 'LandingHeroBlock',
  labels: { singular: 'Landing — Hero', plural: 'Landing — Hero' },
  fields: [
    photoField('photo', 'Hlavní fotka (šířka min. 2000 px)'),
    { name: 'intro', type: 'textarea', label: 'Úvodní odstavec' },
    {
      type: 'row',
      fields: [
        { name: 'headlineLight', type: 'text', label: 'Headline — tenká část' },
        { name: 'headlineBold', type: 'text', label: 'Headline — tučná část' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'Text CTA tlačítka' },
        { name: 'navCtaLabel', type: 'text', label: 'Text tlačítka v navigaci' },
      ],
    },
  ],
}
