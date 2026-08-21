import type { Block } from 'payload'

export const MapEmbedWidget: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: { singular: 'Widget — Mapa (Kde nás najdete)', plural: 'Widgety — Mapa' },
  fields: [
    { name: 'title', type: 'text', label: 'Nadpis' },
    {
      name: 'embedUrl',
      type: 'text',
      required: true,
      label: 'URL mapy pro vložení (iframe)',
      admin: {
        description:
          'Mapy.cz: Sdílet → Vložit na web. Google Maps: Sdílet → Vložit mapu → zkopírovat src z iframe.',
      },
    },
    {
      name: 'pills',
      type: 'array',
      label: 'Adresní pilulky pod mapou',
      labels: { singular: 'Pilulka', plural: 'Pilulky' },
      fields: [{ name: 'text', type: 'text', label: 'Text', required: true }],
    },
  ],
}
