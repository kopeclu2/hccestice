import type { Block } from 'payload'

export const SectionHeadingBlock: Block = {
  slug: 'sectionHeading',
  interfaceName: 'SectionHeadingBlockType',
  labels: { singular: 'Nadpis sekce', plural: 'Nadpisy sekcí' },
  fields: [
    { name: 'kicker', type: 'text', label: 'Štítek nad nadpisem (pill)' },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', label: 'Nadpis', required: true },
        { name: 'titleHighlight', type: 'text', label: 'Zvýrazněná část (lime)' },
      ],
    },
    { name: 'perex', type: 'textarea', label: 'Perex pod nadpisem' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'Text tlačítka vpravo' },
        { name: 'ctaHref', type: 'text', label: 'Cíl tlačítka (#kotva nebo /cesta)' },
      ],
    },
  ],
}
