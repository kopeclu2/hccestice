import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

/**
 * Milníky historie klubu pro stránku /historie-klubu.
 *
 * Éry (nadpisy timeline) jsou fixní v kódu (`HISTORY_PAGE.eras`
 * v `landing/content.ts`) — tady se jen vybírá, do které éry milník
 * patří. Rok je text, aby šlo zapsat i „70. léta".
 */
export const Milestones: CollectionConfig = {
  slug: 'milestones',
  labels: {
    singular: 'Milník',
    plural: 'Milníky (historie)',
  },
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
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
    defaultColumns: ['year', 'title', 'era', 'order'],
    description:
      'Timeline na stránce Historie klubu. Milníky bez fotky se vykreslí jen textově, prázdné éry se nezobrazí.',
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'year',
          type: 'text',
          label: 'Rok',
          required: true,
          admin: { description: 'Např. „1954" nebo „70. léta"' },
        },
        {
          name: 'era',
          type: 'select',
          label: 'Éra',
          required: true,
          defaultValue: 'vchl',
          options: [
            { label: 'Začátky (1954—1960)', value: 'zacatky' },
            { label: 'Vlastní zázemí (2007—2008)', value: 'zazemi' },
            { label: 'Éra VČHL (2015—dnes)', value: 'vchl' },
          ],
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titulek',
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Text',
      required: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Fotka (volitelné)',
      admin: { description: 'Archivní sken nebo fotka — vykreslí se natočená jako polaroid.' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Řazení',
      defaultValue: 0,
      admin: { description: 'Vzestupně v rámci celé timeline (nižší = dřív).' },
    },
  ],
}
