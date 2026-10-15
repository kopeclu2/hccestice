import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { notSyncedFromAhl } from '../access/notSyncedFromAhl'
import { generateMatchSlug } from '../hooks/matchSlug'
import { revalidateLanding, revalidateLandingDelete } from '../hooks/revalidateLanding'
import { revalidateMatchFeeds, revalidateMatchFeedsDelete } from '../hooks/revalidateMatchFeeds'

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
    description:
      'Zápasy s vyplněným „ID zápasu na AHL" spravuje automatická synchronizace z AHL.cz — jejich údaje jsou jen pro čtení. Smazáním ID se zápas odpojí natrvalo (synchronizace ho už nepáruje ani nezakládá znovu) a jde upravit ručně.',
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
          async ({ data, originalDoc, req }) => {
            // Update jen s části polí (např. `{ ahl: … }` z synchronizace) nenese
            // `opponent` ani `home` — chybějící hodnoty se berou z uloženého
            // dokumentu, jinak by se titulek přepsal na „soupeř x HC Čestice".
            const opponentId = data?.opponent ?? originalDoc?.opponent
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
            const home = data?.home ?? originalDoc?.home
            return home ? `HC Čestice x ${opponentName}` : `${opponentName} x HC Čestice`
          },
        ],
      },
    },
    {
      // Adresa patří webu, ne AHL — proto bez `notSyncedFromAhl`.
      name: 'slug',
      type: 'text',
      label: 'Adresa (slug)',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Adresa detailu zápasu: /zapasy/<slug>. Vygeneruje se jednou při založení (datum + soupeř) a při přeložení zápasu se záměrně nemění, aby odkazy zůstaly stabilní. Prázdné pole se při uložení doplní. POZOR: ruční změna adresy rozbije už sdílené odkazy — stará adresa pak vrací 404 (přesměrování se nezakládá).',
      },
      hooks: {
        // Duplikát zápasu nesmí zdědit adresu originálu (je `unique`).
        // `undefined` nestačí: Payload hodnotu přepíše, jen když hook vrátí
        // něco jiného než `undefined` (`beforeDuplicate/promise.js`), takže
        // by slug originálu zůstal a insert by spadl na unikátním indexu.
        // S `null` hook `generateMatchSlug` slug vygeneruje znovu (`-2`).
        beforeDuplicate: [() => null],
      },
    },
    {
      name: 'date',
      access: { update: notSyncedFromAhl },
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
      access: { update: notSyncedFromAhl },
      type: 'text',
      admin: { description: 'OLLH, VČHL, přátelák, turnaj…' },
    },
    {
      name: 'opponent',
      access: { update: notSyncedFromAhl },
      type: 'relationship',
      relationTo: 'opponents',
      required: true,
    },
    {
      name: 'home',
      access: { update: notSyncedFromAhl },
      type: 'checkbox',
      defaultValue: true,
      label: 'Domácí zápas',
    },
    {
      name: 'venue',
      access: { update: notSyncedFromAhl },
      type: 'text',
      label: 'Místo konání',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scoreOurs',
          access: { update: notSyncedFromAhl },
          type: 'number',
          label: 'Góly HC Čestice',
          min: 0,
        },
        {
          name: 'scoreOpp',
          access: { update: notSyncedFromAhl },
          type: 'number',
          label: 'Góly soupeře',
          min: 0,
        },
      ],
    },
    {
      name: 'status',
      access: { update: notSyncedFromAhl },
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
        {
          name: 'overtime',
          access: { update: notSyncedFromAhl },
          type: 'checkbox',
          label: 'Prodloužení',
          defaultValue: false,
        },
        {
          name: 'shootout',
          access: { update: notSyncedFromAhl },
          type: 'checkbox',
          label: 'Nájezdy',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'thirds',
      access: { update: notSyncedFromAhl },
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
      name: 'ahl',
      type: 'group',
      label: 'AHL.cz',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'matchId',
          type: 'number',
          label: 'ID zápasu na AHL',
          unique: true,
          index: true,
          hooks: {
            // Duplikát zápasu z AHL by zdědil `unique` ID a insert by spadl
            // (ověřeno `payload.duplicate`). Kopie je ruční zápas bez vazby.
            beforeDuplicate: [() => null],
          },
          admin: {
            description:
              'Podle tohoto ID se zápas páruje s AHL.cz. Dokud je vyplněné, synchronizovaná pole (datum, soupeř, skóre, branky, sestavy…) přepisuje AHL. Smazáním ID zápas odpojíte natrvalo a můžete ho upravovat ručně — synchronizace ho už znovu nespáruje podle data a soupeře. Znovu připojit jde jen ručním vrácením ID.',
          },
        },
        { name: 'hasReport', type: 'checkbox', label: 'Zápis vložen', admin: { readOnly: true } },
        {
          name: 'syncedAt',
          type: 'date',
          label: 'Naposledy synchronizováno',
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
        },
        {
          name: 'draftPostCreated',
          type: 'checkbox',
          label: 'Koncept reportáže vytvořen',
          admin: { readOnly: true },
        },
        {
          // Verze zpracování zápisu. Podle ní job pozná zápasy, které je potřeba
          // znovu stáhnout, když se ze zápisu začne brát nové pole (backfill).
          // `null` = verze 1.
          name: 'detailVersion',
          type: 'number',
          label: 'Verze zpracování zápisu',
          admin: { readOnly: true, hidden: true },
        },
      ],
    },
    {
      name: 'goals',
      type: 'array',
      label: 'Branky',
      labels: { singular: 'Branka', plural: 'Branky' },
      access: { update: notSyncedFromAhl },
      admin: { initCollapsed: true, description: 'Plní synchronizace ze zápisu o utkání.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'time', type: 'text', label: 'Čas (mm:ss)' },
            {
              name: 'side',
              type: 'select',
              label: 'Strana',
              options: [
                { label: 'HC Čestice', value: 'ours' },
                { label: 'Soupeř', value: 'opp' },
              ],
            },
            { name: 'strength', type: 'text', label: 'Početní stav (5/4)' },
            { name: 'scoreAfter', type: 'text', label: 'Skóre po gólu' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'scorer', type: 'relationship', relationTo: 'players', label: 'Střelec' },
            { name: 'scorerName', type: 'text', label: 'Střelec (jméno z AHL)' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'assist1', type: 'relationship', relationTo: 'players', label: '1. asistence' },
            { name: 'assist1Name', type: 'text', label: '1. asistence (jméno z AHL)' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'assist2', type: 'relationship', relationTo: 'players', label: '2. asistence' },
            { name: 'assist2Name', type: 'text', label: '2. asistence (jméno z AHL)' },
          ],
        },
      ],
    },
    {
      name: 'lineup',
      type: 'array',
      label: 'Sestava',
      labels: { singular: 'Hráč', plural: 'Sestava' },
      access: { update: notSyncedFromAhl },
      admin: { initCollapsed: true, description: 'Plní synchronizace ze zápisu o utkání.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'player', type: 'relationship', relationTo: 'players', label: 'Hráč' },
            { name: 'name', type: 'text', label: 'Jméno (z AHL)' },
            { name: 'number', type: 'number', label: 'Číslo' },
            { name: 'goalie', type: 'checkbox', label: 'Brankář', defaultValue: false },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'goals', type: 'number', label: 'Góly', min: 0 },
            { name: 'assists', type: 'number', label: 'Asistence', min: 0 },
            { name: 'pim', type: 'number', label: 'Trestné minuty', min: 0 },
          ],
        },
      ],
    },
    {
      name: 'penalties',
      type: 'array',
      label: 'Tresty',
      labels: { singular: 'Trest', plural: 'Tresty' },
      access: { update: notSyncedFromAhl },
      admin: {
        initCollapsed: true,
        description:
          'Tresty hráčů HC Čestice ze zápisu o utkání. Plní synchronizace; tresty soupeře se neukládají.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'time', type: 'text', label: 'Čas (mm:ss)' },
            { name: 'minutes', type: 'number', label: 'Minuty', min: 0 },
            { name: 'kind', type: 'text', label: 'Druh trestu' },
            { name: 'reason', type: 'text', label: 'Důvod' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'player', type: 'relationship', relationTo: 'players', label: 'Hráč' },
            { name: 'playerName', type: 'text', label: 'Hráč (jméno z AHL)' },
          ],
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      label: 'Statistika zápasu',
      // Field access na pojmenované skupině platí pro celou skupinu: při
      // zamčení se příchozí hodnota zahodí a doplní z uloženého dokumentu
      // (payload/dist/fields/hooks/beforeValidate/promise.js, getFallbackValue).
      access: { update: notSyncedFromAhl },
      admin: { description: 'Ze zápisu o utkání na AHL.cz, pořadí HC Čestice : soupeř.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'penaltiesOurs', type: 'number', label: 'Vyloučení — HC Čestice', min: 0 },
            { name: 'penaltiesOpp', type: 'number', label: 'Vyloučení — soupeř', min: 0 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'majorsOurs', type: 'number', label: 'Vyšší tresty — HC Čestice', min: 0 },
            { name: 'majorsOpp', type: 'number', label: 'Vyšší tresty — soupeř', min: 0 },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ppGoalsOurs',
              type: 'number',
              label: 'Branky v přesilovce — HC Čestice',
              min: 0,
            },
            { name: 'ppGoalsOpp', type: 'number', label: 'Branky v přesilovce — soupeř', min: 0 },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'ppTimeOurs', type: 'text', label: 'Čas v přesilovce — HC Čestice' },
            { name: 'ppTimeOpp', type: 'text', label: 'Čas v přesilovce — soupeř' },
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
    beforeChange: [generateMatchSlug],
    // /zapasy ani home blok Sezóna nemají ISR — bez revalidace by se nový
    // zápas neobjevil až do dalšího buildu. `revalidateMatchFeeds` k tomu
    // invaliduje `matches-sitemap.xml` (detaily `/zapasy/[slug]`).
    afterChange: [revalidateLanding, revalidateMatchFeeds],
    afterDelete: [revalidateLandingDelete, revalidateMatchFeedsDelete],
  },
}
