import type { CollectionConfig, PayloadRequest, Plugin } from 'payload'
import { auditorPlugin } from 'payload-auditor'

import { authenticated } from '@/access/authenticated'

/**
 * Auditní log — kdo v adminu co změnil, založil nebo smazal.
 *
 * Plugin `payload-auditor` umí jen navěsit hooky a uložit řádek; co v tom
 * řádku bude, si musíme doplnit sami:
 *
 * - `identifier`, které plugin plní, je **slug kolekce**, ne ID dokumentu
 *   (`payload-auditor/dist/pluginUtils/attachCollectionConfig`), takže
 *   „smazán zápas" by bez `customLogger` neřeklo, který zápas.
 * - uživatele plugin neloguje vůbec.
 *
 * Obojí dodává `describeCollection` / `describeGlobal` níž do polí
 * `documentId` a `user`, která proto musí být i na kolekci — Payload klíče
 * bez odpovídajícího pole při `create` zahodí.
 */

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Kolekce, u kterých se sledují zápisy. Vedle vlastních kolekcí projektu
 * i ty, které přidávají pluginy a které edituje správce.
 *
 * Vědomě chybí:
 * - `form-submissions` — plní je veřejný kontaktní formulář, ne editor,
 * - `search` — zrcadlo článků, které si searchPlugin přepisuje sám,
 * - `payload-*` systémové kolekce.
 */
const TRACKED_COLLECTIONS = [
  'pages',
  'posts',
  'media',
  'categories',
  'seasons',
  'teams',
  'players',
  'matches',
  'opponents',
  'galleries',
  'sponsors',
  'people',
  'products',
  'milestones',
  'redirects',
  'forms',
  'navigation-containers',
  'navigation-items',
] as const

const TRACKED_GLOBALS = ['header', 'footer', 'siteConfig', 'sidebar'] as const

/**
 * Strukturální nadtyp argumentů všech hooků — balíček své typy neexportuje
 * (`exports` má jen `.`, `./client`, `./rsc`), takže si je popisujeme sami.
 * Stačí to, co čteme; kontravariance parametrů zajistí přiřaditelnost ke
 * konkrétnímu hooku.
 */
type HookArgs = {
  req: PayloadRequest
  doc?: { id?: number | string } | null
  id?: number | string
  global?: { slug: string }
}

type LogFields = {
  identifier: string
  scope: 'collection' | 'field' | 'global'
  timestamp: Date
  userAgent?: string
}

const describeUser = (req: PayloadRequest): string => {
  const user = req.user
  if (!user) return 'systém'
  return [user.name, user.email].filter(Boolean).join(' – ') || String(user.id)
}

/**
 * Návratový typ je `any` schválně: `documentId` ani `user` nejsou v typu
 * `AuditorLog` pluginu, přestože je do databáze uloží. `hook` a `operation`
 * plugin doplňuje až za nás, proto je tu neřešíme.
 */
const describeCollection = (args: HookArgs, fields: LogFields): any => ({
  ...fields,
  documentId: String(args.doc?.id ?? args.id ?? ''),
  user: describeUser(args.req),
})

const describeGlobal = (args: HookArgs, fields: LogFields): any => ({
  ...fields,
  // Plugin posílá u globalů `scope: 'collection'`
  // (`attachGlobalConfig.js` — natvrdo `scopeSlug: 'collection'`).
  scope: 'global',
  documentId: '',
  user: describeUser(args.req),
})

const auditLogCollection: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Auditní záznam', plural: 'Auditní log' },
  access: {
    read: authenticated,
    // Zapisuje jen plugin přes Local API (`overrideAccess` je tam ve
    // výchozím stavu `true`), takže záznamy nejde z adminu zfalšovat.
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    group: 'Systém',
    useAsTitle: 'operation',
    defaultColumns: ['createdAt', 'operation', 'identifier', 'documentId', 'user'],
  },
  fields: [
    { name: 'operation', type: 'text', label: 'Operace', required: true },
    { name: 'identifier', type: 'text', label: 'Kolekce', required: true },
    { name: 'documentId', type: 'text', label: 'ID dokumentu' },
    { name: 'user', type: 'text', label: 'Uživatel' },
    {
      name: 'scope',
      type: 'select',
      label: 'Rozsah',
      required: true,
      options: [
        { value: 'collection', label: 'Kolekce' },
        { value: 'global', label: 'Global' },
      ],
    },
    { name: 'userAgent', type: 'text', label: 'Prohlížeč' },
    { name: 'hook', type: 'text', label: 'Hook' },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Kdy',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true },
    },
  ],
  timestamps: false,
}

export const auditor = (): Plugin =>
  auditorPlugin({
    // `realtime` místo výchozího `time`: buffer v RAM by se při redeployi
    // ztratil a `setInterval` z `onInit` v dev režimu přežívá HMR.
    buffer: { flushStrategy: 'realtime' },
    automation: {
      logCleanup: {
        olderThan: RETENTION_MS,
        cronTime: '0 3 * * *',
      },
    },
    collections: {
      track: [
        {
          slug: 'users',
          hooks: {
            afterChange: { enabled: true, customLogger: describeCollection },
            afterDelete: { enabled: true, customLogger: describeCollection },
            afterLogin: { enabled: true, customLogger: describeCollection },
            afterLogout: { enabled: true, customLogger: describeCollection },
          },
        },
        ...TRACKED_COLLECTIONS.map((slug) => ({
          slug,
          hooks: {
            afterChange: { enabled: true, customLogger: describeCollection },
            afterDelete: { enabled: true, customLogger: describeCollection },
          },
        })),
      ],
    },
    globals: {
      track: TRACKED_GLOBALS.map((slug) => ({
        slug,
        hooks: {
          afterChange: { enabled: true, customLogger: describeGlobal },
        },
      })),
    },
    configureRootCollection: () => auditLogCollection,
  })
