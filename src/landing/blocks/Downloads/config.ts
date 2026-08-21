import type { Block } from 'payload'

export const DownloadsWidget: Block = {
  slug: 'downloads',
  interfaceName: 'DownloadsBlock',
  labels: { singular: 'Widget — Dokumenty ke stažení', plural: 'Widgety — Dokumenty' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'items',
      type: 'array',
      label: 'Soubory',
      labels: { singular: 'Soubor', plural: 'Soubory' },
      minRows: 1,
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Soubor (PDF, DOC…)',
        },
        { name: 'label', type: 'text', label: 'Popisek (prázdné = název souboru)' },
      ],
    },
  ],
}
