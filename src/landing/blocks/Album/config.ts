import type { Block } from 'payload'

import { photoField } from '../shared'

export const LandingAlbum: Block = {
  slug: 'landingAlbum',
  interfaceName: 'LandingAlbumBlock',
  labels: { singular: 'Landing — Fotoalbum', plural: 'Landing — Fotoalbum' },
  fields: [
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      label: 'Připnutá galerie',
      admin: {
        description:
          'Nepovinné — bude první velká dlaždice. Prázdné = mozaika ukáže nejnovější galerie.',
      },
    },
    {
      name: 'mosaic',
      type: 'array',
      label: 'Ruční mozaika (přepíše automatickou)',
      labels: { singular: 'Dlaždice', plural: 'Dlaždice' },
      admin: {
        description:
          'Prázdné = 6 nejnovějších galerií. Vyplňujte jen výjimečně — ruční dlaždice se samy neaktualizují. Velikost: velká = 2×2, široká = 2×1, dlaždice = 1×1',
      },
      fields: [
        photoField('photo'),
        {
          name: 'span',
          type: 'select',
          label: 'Velikost',
          defaultValue: 'tile',
          options: [
            { label: 'Velká (2×2)', value: 'big' },
            { label: 'Široká (2×1)', value: 'wide' },
            { label: 'Dlaždice (1×1)', value: 'tile' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Titulek přes fotku',
              // Malá dlaždice má v handoffu jen štítek — titulek by se do ní
              // nevešel, proto se pole podle velikosti přepíná.
              admin: { condition: (_, siblings) => siblings?.span !== 'tile' },
            },
            {
              name: 'chip',
              type: 'text',
              label: 'Štítek vlevo dole',
              admin: { condition: (_, siblings) => siblings?.span === 'tile' },
            },
          ],
        },
        {
          name: 'href',
          type: 'text',
          label: 'Odkaz',
          admin: {
            description: 'Např. /fotogalerie/play-off-2026. Prázdné = dlaždice není klikatelná.',
          },
        },
      ],
    },
  ],
}
