import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'

/**
 * Lidé v klubu — funkcionáři, trenéři, realizační tým.
 *
 * Samostatná kolekce (ne pole v landing globalu), aby šla použít
 * i na dalších stránkách (kontakty, podstránky). Landing page si
 * vybírá, koho zobrazit, relací v globalu `landingPage` → tab Lidé.
 */
export const People: CollectionConfig = {
  slug: 'people',
  labels: {
    singular: 'Osoba',
    plural: 'Lidé v klubu',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Hokej',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'phone', 'order'],
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Jméno',
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      label: 'Role',
      admin: { description: 'Např. „Předseda oddílu", „Trenér mužů"' },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Poznámka',
      admin: { description: 'Doplněk k roli, např. „Tréninky a sestava A-týmu"' },
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Telefon' },
        { name: 'email', type: 'email', label: 'E-mail' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Portrét',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Pořadí',
    },
  ],
  hooks: {
    afterChange: [revalidateLanding],
    afterDelete: [revalidateLandingDelete],
  },
}
