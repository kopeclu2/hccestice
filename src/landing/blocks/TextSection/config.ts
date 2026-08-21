import type { Block } from 'payload'

export const TextSectionBlock: Block = {
  slug: 'textSection',
  interfaceName: 'TextSectionBlockType',
  labels: { singular: 'Textová sekce', plural: 'Textové sekce' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Obsah',
      required: true,
    },
    {
      name: 'appearance',
      type: 'select',
      label: 'Vzhled',
      // plain = text lícuje s ostatními bloky; karta text odsazuje o svůj padding
      defaultValue: 'plain',
      options: [
        { label: 'Bez karty (na pozadí)', value: 'plain' },
        { label: 'Bílá karta', value: 'card' },
      ],
    },
  ],
}
