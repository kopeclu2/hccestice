import type { Block } from 'payload'

import { photoField } from '../shared'

export const LandingSeason: Block = {
  slug: 'landingSeason',
  interfaceName: 'LandingSeasonBlock',
  labels: { singular: 'Landing — Sezóna', plural: 'Landing — Sezóna' },
  fields: [
    /**
     * Pozůstatek po sekci „Jak jsme hráli" (mřížka fotoreportů), která
     * se na home page už nevykresluje. Pole je jen skryté, aby se
     * nemuselo zahazovat uložené obsazení fotek v databázi.
     */
    {
      name: 'reportPhotos',
      type: 'array',
      label: 'Fotky ke kartám posledních zápasů',
      admin: { hidden: true },
      maxRows: 4,
      fields: [photoField('photo')],
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      label: 'Sezóna tabulky',
      admin: {
        description:
          'Tabulka se čte z dokumentu sezóny (Sezóny → Tabulka ligy). Prázdné = aktuální sezóna.',
      },
    },
  ],
}
