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
      name: 'ahl',
      type: 'group',
      label: 'AHL.cz',
      admin: {
        position: 'sidebar',
        description:
          'Identifikátory ročníku se mění s každou sezónou. Prázdné hodnoty dohledá synchronizace autodetekcí.',
      },
      fields: [
        { name: 'competitionYearId', type: 'number', label: 'ID ročníku (souteznirocnikid)' },
        {
          name: 'participantId',
          type: 'number',
          label: 'ID HC Čestice v ročníku (ucastniksouteznihorocnikuid)',
        },
      ],
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
          name: 'syncedAt',
          type: 'date',
          label: 'Naposledy synchronizováno',
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
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
            {
              type: 'row',
              fields: [
                { name: 'wins', type: 'number', label: 'Výhry' },
                { name: 'otWins', type: 'number', label: 'Výhry v prodloužení/nájezdech' },
                { name: 'otLosses', type: 'number', label: 'Prohry v prodloužení/nájezdech' },
                { name: 'losses', type: 'number', label: 'Prohry' },
                { name: 'goalsFor', type: 'number', label: 'Vstřelené góly' },
                { name: 'goalsAgainst', type: 'number', label: 'Obdržené góly' },
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
