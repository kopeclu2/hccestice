import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import {
  RESET_TOKEN_HOURS,
  resetPasswordHtml,
  resetPasswordSubject,
} from '../../email/templates/resetPassword'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Uživatel',
    plural: 'Uživatelé',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Systém',
    defaultColumns: ['name', 'role', 'email', 'phone'],
    useAsTitle: 'name',
  },
  auth: {
    forgotPassword: {
      // Hodinu drží i výchozí Payload, uvedeno explicitně, protože stejnou
      // dobu píše šablona do textu mailu (`RESET_TOKEN_HOURS`).
      expiration: RESET_TOKEN_HOURS * 60 * 60 * 1000,
      generateEmailHTML: resetPasswordHtml,
      generateEmailSubject: resetPasswordSubject,
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: 'Jméno' },
        { name: 'lastName', type: 'text', label: 'Příjmení' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      label: 'Celé jméno',
      admin: {
        readOnly: true,
        description: 'Skládá se automaticky z jména a příjmení.',
      },
    },
    {
      name: 'role',
      type: 'text',
      label: 'Role',
      admin: { description: 'Funkce nebo role, např. „Předseda oddílu", „Trenér mužů"' },
    },
    { name: 'phone', type: 'text', label: 'Telefon' },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Portrét',
      admin: {
        description: 'Zobrazuje se ve vizitce autora pod článkem.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && (data.firstName || data.lastName)) {
          data.name = [data.firstName, data.lastName].filter(Boolean).join(' ')
        }
        return data
      },
    ],
  },
  timestamps: true,
}
