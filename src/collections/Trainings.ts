import type { CollectionConfig, DateFieldValidation } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateTrainings, revalidateTrainingsDelete } from '../hooks/revalidateTrainings'
import { fillTraining } from '../hooks/trainingHooks'

/**
 * Konec musí být po začátku. `validate` pole bere začátek ze `siblingData`
 * (formulář) — update jen s `endsAt` ho nenese, pak se neověřuje.
 */
const endsAfterStart: DateFieldValidation = (value, { siblingData }) => {
  if (!value) return true
  const start = (siblingData as { date?: string | null }).date
  if (!start) return true
  if (new Date(value).getTime() <= new Date(start).getTime()) {
    return 'Konec tréninku musí být později než začátek.'
  }
  return true
}

/**
 * Termín ledové hodiny — jeden dokument = jeden konkrétní trénink
 * („úterý 3. 11. 2026, 16:00–17:15"). Den v týdnu se neukládá, počítá se
 * z data. Web ukazuje budoucí termíny bez `hiddenOnWeb`.
 *
 * Datum je `date` pole Payloadu stejně jako `matches.date` (uloženo v UTC,
 * v adminu se zadává v čase prohlížeče); web formátuje vždy v Europe/Prague.
 */
export const Trainings: CollectionConfig = {
  slug: 'trainings',
  labels: {
    singular: 'Trénink',
    plural: 'Tréninky',
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
    description:
      'Rozpis ledových hodin: jeden záznam je jeden termín. Web ukazuje jen budoucí termíny, které nejsou skryté.',
    defaultColumns: ['title', 'season', 'hiddenOnWeb'],
  },
  defaultSort: 'date',
  fields: [
    {
      // Odvozený titulek („út 3. 11. 2026 · Muži + děti") — plní `fillTraining`.
      name: 'title',
      type: 'text',
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Začátek',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'endsAt',
          type: 'date',
          label: 'Konec',
          validate: endsAfterStart,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Volitelné. Prázdné = web ukáže jen čas začátku.',
          },
        },
      ],
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      hasMany: false,
      index: true,
      label: 'Sezóna',
      admin: {
        position: 'sidebar',
        description: 'Prázdné = při založení se doplní podle data (sezóna začíná 1. srpna).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          type: 'text',
          label: 'Skupina',
          admin: { description: 'Štítek termínu, např. „Muži + děti".' },
        },
        {
          name: 'venue',
          type: 'text',
          label: 'Místo',
          admin: { description: 'Prázdné = web doplní „ZS Rychnov nad Kněžnou".' },
        },
      ],
    },
    {
      name: 'note',
      type: 'text',
      label: 'Poznámka',
      admin: { description: 'Drobný řádek v tabulce, např. „Bez brankáře" nebo „Turnaj".' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'joint',
          type: 'checkbox',
          label: 'Zvýraznit',
          defaultValue: false,
          admin: { description: 'Tmavý řádek s lime štítkem — společný trénink, turnaj…' },
        },
        {
          name: 'hiddenOnWeb',
          type: 'checkbox',
          label: 'Skrýt na webu',
          defaultValue: false,
          admin: { description: 'Zrušený trénink se skryje, aniž by se záznam mazal.' },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [fillTraining],
    afterChange: [revalidateTrainings],
    afterDelete: [revalidateTrainingsDelete],
  },
}
