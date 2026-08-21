import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

export const Seasons: CollectionConfig = {
  slug: 'seasons',
  labels: {
    singular: 'Sezóna',
    plural: 'Sezóny',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Hokej',
    useAsTitle: 'title',
    defaultColumns: ['title', 'startYear', 'isCurrent'],
  },
  defaultSort: '-startYear',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Např. „2025 – 2026"' },
    },
    {
      name: 'startYear',
      type: 'number',
      required: true,
      index: true,
      admin: { description: 'Rok začátku sezóny (pro řazení), např. 2025' },
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
      label: 'Aktuální sezóna',
    },
    {
      name: 'standings',
      type: 'group',
      label: 'Tabulka ligy',
      admin: {
        description:
          'Průběžná/konečná tabulka soutěže v této sezóně — zobrazuje ji homepage a bloky. Řádek HC Čestice se zvýrazní automaticky.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Popisek (např. základní část 2025/26)' },
            { name: 'fullTableUrl', type: 'text', label: 'Odkaz na celou tabulku (ahl.cz)' },
          ],
        },
        {
          name: 'rows',
          type: 'array',
          label: 'Řádky',
          labels: { singular: 'Řádek', plural: 'Řádky' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'pos', type: 'number', label: 'Pořadí', required: true },
                { name: 'team', type: 'text', label: 'Tým', required: true },
                { name: 'games', type: 'number', label: 'Zápasy' },
                { name: 'points', type: 'number', label: 'Body' },
              ],
            },
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
