import type { Block } from 'payload'

export const AlertBlock: Block = {
  slug: 'alertBlock',
  interfaceName: 'AlertBlock',
  labels: {
    singular: 'Upozornění',
    plural: 'Upozornění',
  },
  fields: [
    {
      name: 'message',
      type: 'richText',
      required: true,
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'warning',
      options: [
        { label: 'Upozornění (žlutá)', value: 'warning' },
        { label: 'Důležité (červená)', value: 'danger' },
        { label: 'Informace (modrá)', value: 'info' },
      ],
    },
  ],
}
