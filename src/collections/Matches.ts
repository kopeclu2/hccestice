import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

export const Matches: CollectionConfig = {
  slug: 'matches',
  labels: {
    singular: 'Zápas',
    plural: 'Zápasy',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Hokej',
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'date', 'status', 'season', 'team'],
  },
  defaultSort: '-date',
  fields: [
    {
      name: 'displayTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            const opponentId = data?.opponent
            let opponentName = 'soupeř'
            if (opponentId) {
              try {
                const opp = await req.payload.findByID({
                  collection: 'opponents',
                  id: typeof opponentId === 'object' ? opponentId.id : opponentId,
                  depth: 0,
                })
                opponentName = opp?.name ?? opponentName
              } catch {
                /* ponechat výchozí */
              }
            }
            const home = data?.home
            return home ? `HC Čestice x ${opponentName}` : `${opponentName} x HC Čestice`
          },
        ],
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      required: true,
      index: true,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      index: true,
    },
    {
      name: 'competition',
      type: 'text',
      admin: { description: 'OLLH, VČHL, přátelák, turnaj…' },
    },
    {
      name: 'opponent',
      type: 'relationship',
      relationTo: 'opponents',
      required: true,
    },
    {
      name: 'home',
      type: 'checkbox',
      defaultValue: true,
      label: 'Domácí zápas',
    },
    {
      name: 'venue',
      type: 'text',
      label: 'Místo konání',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scoreOurs',
          type: 'number',
          label: 'Góly HC Čestice',
          min: 0,
        },
        {
          name: 'scoreOpp',
          type: 'number',
          label: 'Góly soupeře',
          min: 0,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: 'Naplánováno', value: 'scheduled' },
        { label: 'Odehráno', value: 'played' },
        { label: 'Zrušeno', value: 'canceled' },
      ],
      index: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'overtime', type: 'checkbox', label: 'Prodloužení', defaultValue: false },
        { name: 'shootout', type: 'checkbox', label: 'Nájezdy', defaultValue: false },
      ],
    },
    {
      name: 'thirds',
      type: 'array',
      label: 'Třetiny',
      maxRows: 5,
      admin: {
        description:
          'Skóre po třetinách (příp. prodloužení/nájezdy). Prázdné = na webu se rozpis třetin nezobrazí.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'ours', type: 'number', label: 'HC Čestice', min: 0, required: true },
            { name: 'opp', type: 'number', label: 'Soupeř', min: 0, required: true },
          ],
        },
      ],
    },
    {
      name: 'report',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Reportáž',
    },
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      label: 'Fotogalerie',
    },
  ],
  hooks: {
    // /zapasy ani home blok Sezóna nemají ISR — bez revalidace by se nový
    // zápas neobjevil až do dalšího buildu.
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
