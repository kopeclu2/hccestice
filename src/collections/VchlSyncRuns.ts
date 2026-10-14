import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Protokol běhů synchronizace s AHL.cz. Zapisuje ho jen job přes Local API
 * (`overrideAccess` je tam ve výchozím stavu `true`), takže je z adminu
 * jen ke čtení — stejný vzor jako `audit-log`. Do auditního logu se
 * záměrně nezapisuje (každý běh by ho zaplavil), viz `plugins/auditor.ts`.
 */
export const VchlSyncRuns: CollectionConfig = {
  slug: 'vchl-sync-runs',
  labels: { singular: 'Běh synchronizace', plural: 'Běhy synchronizace' },
  access: {
    read: authenticated,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: 'Systém',
    useAsTitle: 'startedAt',
    defaultColumns: ['startedAt', 'trigger', 'status', 'requests', 'finishedAt'],
  },
  defaultSort: '-startedAt',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'trigger',
          type: 'select',
          label: 'Spuštění',
          options: [
            { label: 'Plánovač', value: 'cron' },
            { label: 'Ručně', value: 'manual' },
            { label: 'Zkušební (bez zápisu)', value: 'dry' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          label: 'Výsledek',
          index: true,
          options: [
            { label: 'V pořádku', value: 'ok' },
            { label: 'Částečně', value: 'partial' },
            { label: 'Chyba', value: 'error' },
            { label: 'Přeskočeno', value: 'skipped' },
          ],
        },
        { name: 'requests', type: 'number', label: 'Počet požadavků na AHL' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startedAt',
          type: 'date',
          label: 'Začátek',
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'finishedAt',
          type: 'date',
          label: 'Konec',
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    { name: 'changes', type: 'json', label: 'Změny' },
    {
      name: 'warnings',
      type: 'array',
      label: 'Upozornění',
      labels: { singular: 'Upozornění', plural: 'Upozornění' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Typ',
              options: [
                { label: 'Neznámý hráč', value: 'unknown-player' },
                { label: 'Neznámý soupeř', value: 'unknown-opponent' },
                { label: 'Nejednoznačný hráč', value: 'ambiguous-player' },
                { label: 'Přeložený zápas', value: 'rescheduled' },
                { label: 'Zápas chybí na AHL', value: 'missing-on-ahl' },
                { label: 'Nesedí statistiky', value: 'stats-mismatch' },
                { label: 'Jiné', value: 'other' },
              ],
            },
            { name: 'message', type: 'text', label: 'Zpráva' },
            { name: 'ref', type: 'text', label: 'Odkaz (ID zápasu/hráče)' },
          ],
        },
      ],
    },
    { name: 'error', type: 'textarea', label: 'Chyba' },
    { name: 'sentryEventId', type: 'text', label: 'ID události v Sentry' },
  ],
  timestamps: true,
}
