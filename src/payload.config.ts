import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { cs } from '@payloadcms/translations/languages/cs'
import { en } from '@payloadcms/translations/languages/en'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'

import { defaultLexical } from '@/fields/defaultLexical'
import { hasBearerSecret } from '@/lib/bearer'
import { getServerSideURL } from '@/lib/getURL'

import { Categories } from './collections/Categories'
import { Galleries } from './collections/Galleries'
import { Matches } from './collections/Matches'
import { Media } from './collections/Media'
import { Milestones } from './collections/Milestones'
import { Opponents } from './collections/Opponents'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { Players } from './collections/Players'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Seasons } from './collections/Seasons'
import { Sponsors } from './collections/Sponsors'
import { Teams } from './collections/Teams'
import { Trainings } from './collections/Trainings'
import { Users } from './collections/Users'
import { VchlSyncRuns } from './collections/VchlSyncRuns'
import { emailAdapter } from './email/adapter'
import { vchlSyncEndpoints } from './endpoints/vchlSync'
import { SiteConfig } from './globals/SiteConfig/config'
import { VchlSync } from './globals/VchlSync/config'
import { vchlSyncTask, VCHL_CRON, VCHL_QUEUE } from './jobs/vchlSync/task'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Původy, ze kterých smí přijít request s cookie přihlášení (`payload-token`).
 * Bez `csrf` Payload bere cookie z libovolného původu, takže cizí stránka by
 * mohla cookie přihlášeného správce zneužít (CSRF). Request s `Origin` mimo
 * seznam se tváří jako nepřihlášený; bez `Origin` (GET z prohlížeče) rozhoduje
 * `Sec-Fetch-Site`, takže same-origin navigace v adminu a v draft módu fungují.
 *
 * Lokálně se přidává `localhost:3000`, jinak by `getServerSideURL()` s
 * nastaveným `NEXT_PUBLIC_SERVER_URL` na ostrou doménu vyřadil přihlášení v devu.
 * V produkci musí `NEXT_PUBLIC_SERVER_URL` odpovídat doméně, ze které se do
 * adminu chodí (zapéká se při buildu).
 *
 * `serverURL` záměrně nenastavujeme: změnil by URL adminu a API na absolutní,
 * takže by admin přestal fungovat na jiném hostu než tom z env (localhost vs.
 * 127.0.0.1, preview domény). Pro `csrf` stačí seznam výš.
 */
const csrfOrigins = [
  getServerSideURL(),
  ...(process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:3000', 'http://127.0.0.1:3000']),
].filter((origin, index, all) => Boolean(origin) && all.indexOf(origin) === index)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '@/components/admin/graphics/Icon#Icon',
        Logo: '@/components/admin/graphics/Logo#Logo',
      },
      beforeDashboard: ['@/components/admin/AdminManual#AdminManual'],
      afterNavLinks: ['@/components/admin/VchlSync/NavLink#VchlSyncNavLink'],
      views: {
        vchlSync: {
          Component: '@/components/admin/VchlSync/View#VchlSyncView',
          path: '/vchl-sync',
          exact: true,
          meta: { title: 'Synchronizace VČHL' },
        },
      },
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // Postgres má max_connections=100; při buildu běží více workerů
      // (prerender ~380 stránek) a bez limitu pool spojení vyčerpá.
      max: 8,
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Seasons,
    Teams,
    Players,
    Matches,
    Trainings,
    Opponents,
    Galleries,
    Sponsors,
    People,
    Products,
    Milestones,
    VchlSyncRuns,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  csrf: csrfOrigins,
  /**
   * Strop `depth` pro všechny dotazy (Payload ho uplatňuje v `afterRead`
   * i pro Local API; výchozích 10 je pro veřejné REST zbytečně hodně).
   * Nejhlubší dotaz ve fetcherech webu je `depth: 2` (`grep 'depth:' src`),
   * takže 2 nic nerozbije. Při přidání hlubšího fetcheru tohle zvednout.
   */
  maxDepth: 2,
  /**
   * Globální limit velikosti nahrávaného souboru — bez něj šlo nahrát cokoli
   * libovolně velkého a zaplnit disk produkčního boxu (`AGENTS.md`: 3,7 GB
   * RAM bez swapu, omezený prostor). 25 MB má rezervu nad největším reálným
   * souborem v `media` (19,3MB TIFF), ale zastaví řádově větší nahrávky.
   * Platí pro všechny upload kolekce (jen `media`) — Payload tohle
   * nekonfiguruje per-kolekci, jen globálně.
   */
  upload: {
    limits: { fileSize: 25 * 1024 * 1024 },
  },
  // Adapter se vybírá podle env proměnných (Resend / SMTP / jen log) —
  // `email` bere i Promise, takže se tu záměrně nečeká na `await`.
  email: emailAdapter(),
  endpoints: vchlSyncEndpoints,
  globals: [SiteConfig, VchlSync],
  // Administrace v češtině (fallback en pro nepřeložené řetězce)
  i18n: {
    fallbackLanguage: 'cs',
    supportedLanguages: { cs, en },
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // Bez přihlášení musí sedět `Authorization: Bearer <CRON_SECRET>`;
        // porovnání v konstantním čase, prázdný secret neprojde nikdy.
        return hasBearerSecret(req.headers.get('authorization'), process.env.CRON_SECRET)
      },
    },
    tasks: [vchlSyncTask],
    // Pole, ne funkce: auditor si v `onInit` přidává vlastní frontu a umí
    // pole jen rozšířit. Výraz má vteřiny jako první pole (viz `task.ts`).
    autoRun: [{ queue: VCHL_QUEUE, cron: VCHL_CRON }],
    // Crony se při `PAYLOAD_CRON=off` nespouští z `instrumentation.ts`, ale
    // `initReq` (první request do adminu) je nastartuje taky — tohle je
    // druhá pojistka a cron se po prvním tiku zastaví.
    shouldAutoRun: () => process.env.PAYLOAD_CRON !== 'off',
  },
})
