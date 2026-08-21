import type { Block } from 'payload'

import { photoField } from '../shared'

export const CtaBannerBlock: Block = {
  slug: 'ctaBanner',
  interfaceName: 'CtaBannerBlockType',
  labels: { singular: 'CTA banner', plural: 'CTA bannery' },
  fields: [
    { name: 'kicker', type: 'text', label: 'Štítek (uppercase řádek)' },
    { name: 'title', type: 'text', label: 'Titulek', required: true },
    { name: 'text', type: 'textarea', label: 'Doplňkový text' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'Text tlačítka' },
        { name: 'ctaHref', type: 'text', label: 'Cíl tlačítka (#kotva nebo /cesta)' },
      ],
    },
    {
      name: 'tone',
      type: 'select',
      label: 'Barva',
      defaultValue: 'green',
      options: [
        { label: 'Klubová zelená', value: 'green' },
        { label: 'Tmavá (ink)', value: 'dark' },
      ],
    },
    photoField('photo', 'Fotka na pozadí (volitelná, ztmavená)'),
  ],
}
