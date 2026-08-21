import type { Block } from 'payload'

export const YouTube: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  labels: {
    singular: 'YouTube video',
    plural: 'YouTube videa',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Odkaz na YouTube video (např. https://www.youtube.com/watch?v=...)',
      },
    },
  ],
}
