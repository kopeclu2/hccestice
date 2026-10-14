import type { GlobalConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

/**
 * Nastavení synchronizace s AHL.cz. Frontend ho nečte, takže tu nejsou
 * hooky revalidace — mění se jen chování jobu. Změnu nastavení ale loguje
 * auditor (`plugins/auditor.ts`).
 */
export const VchlSync: GlobalConfig = {
  slug: 'vchl-sync',
  label: 'Synchronizace VČHL',
  access: { read: authenticated, update: authenticated },
  admin: {
    group: 'Hokej',
    description:
      'Nastavení synchronizace. Spouštění, nanečisto, historii běhů a varování najdete na stránce Synchronizace VČHL (/admin/vchl-sync).',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Automatická synchronizace zapnutá',
      defaultValue: false,
    },
    {
      name: 'parts',
      type: 'group',
      label: 'Co synchronizovat',
      fields: [
        { name: 'schedule', type: 'checkbox', label: 'Rozlosování', defaultValue: true },
        { name: 'results', type: 'checkbox', label: 'Výsledky', defaultValue: true },
        { name: 'matchDetail', type: 'checkbox', label: 'Branky a sestavy', defaultValue: true },
        { name: 'standings', type: 'checkbox', label: 'Tabulka', defaultValue: true },
        {
          name: 'draftPosts',
          type: 'checkbox',
          label: 'Koncept reportáže po zápase',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'timing',
      type: 'group',
      label: 'Frekvence',
      fields: [
        {
          name: 'idleIntervalHours',
          type: 'number',
          label: 'Klidový režim — interval (hodiny)',
          defaultValue: 6,
          min: 1,
          max: 48,
          admin: {
            description: 'Jak často se synchronizuje mimo zápasové dny (rozlosování, tabulka).',
          },
        },
        {
          name: 'matchdayIntervalMinutes',
          type: 'number',
          label: 'Zápasový režim — interval (minuty)',
          defaultValue: 15,
          min: 5,
          max: 120,
          admin: {
            description: 'Jak často se synchronizuje v okolí zápasu, kdy čekáme na výsledek a zápis.',
          },
        },
        {
          name: 'matchdayWindowHours',
          type: 'number',
          label: 'Zápasový režim — okno (hodiny)',
          defaultValue: 48,
          min: 3,
          max: 168,
          admin: {
            description:
              'Zápasový režim platí od tolika hodin před zápasem do doby, než je zápis hotový (nebo toto okno po zápase uplyne).',
          },
        },
      ],
    },
    {
      name: 'notifications',
      type: 'group',
      label: 'Upozornění e-mailem',
      fields: [
        {
          name: 'notifyOn',
          type: 'select',
          hasMany: true,
          label: 'Posílat upozornění při',
          defaultValue: ['failure', 'new-entity', 'rescheduled'],
          options: [
            { label: 'Selhání', value: 'failure' },
            { label: 'Nový hráč nebo soupeř', value: 'new-entity' },
            { label: 'Přeložený zápas', value: 'rescheduled' },
            { label: 'Nový výsledek', value: 'result' },
          ],
        },
        {
          name: 'recipients',
          type: 'array',
          label: 'Příjemci',
          labels: { singular: 'Příjemce', plural: 'Příjemci' },
          admin: {
            description: 'Prázdné = kontaktní e-mail z Nastavení webu.',
          },
          fields: [{ name: 'email', type: 'email', label: 'E-mail', required: true }],
        },
        {
          name: 'failureThreshold',
          type: 'number',
          label: 'Upozornit po tolika selháních v řadě',
          defaultValue: 2,
          min: 1,
        },
      ],
    },
  ],
}
