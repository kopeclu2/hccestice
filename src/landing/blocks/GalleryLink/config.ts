import type { Block } from 'payload'

export const GalleryLinkWidget: Block = {
  slug: 'galleryLink',
  interfaceName: 'GalleryLinkBlock',
  labels: { singular: 'Widget — Odkaz na galerii', plural: 'Widgety — Odkaz na galerii' },
  fields: [
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      required: true,
      label: 'Galerie',
    },
    {
      name: 'label',
      type: 'text',
      label: 'Text odkazu (prázdné = „Zobrazit fotogalerii")',
    },
  ],
}
