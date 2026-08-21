import { postgresAdapter } from '@payloadcms/db-postgres'
import { cs } from '@payloadcms/translations/languages/cs'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Galleries } from './collections/Galleries'
import { Matches } from './collections/Matches'
import { Media } from './collections/Media'
import { Milestones } from './collections/Milestones'
import { Opponents } from './collections/Opponents'
import { Pages } from './collections/Pages'
import { Players } from './collections/Players'
import { Posts } from './collections/Posts'
import { Seasons } from './collections/Seasons'
import { Sponsors } from './collections/Sponsors'
import { People } from './collections/People'
import { Products } from './collections/Products'
import { Teams } from './collections/Teams'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Sidebar } from './globals/Sidebar/config'
import { SiteConfig } from './globals/SiteConfig/config'
import { plugins } from './plugins'
import { emailAdapter } from './email/adapter'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
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
    Opponents,
    Galleries,
    Sponsors,
    People,
    Products,
    Milestones,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  // Adapter se vybírá podle env proměnných (Resend / SMTP / jen log) —
  // `email` bere i Promise, takže se tu záměrně nečeká na `await`.
  email: emailAdapter(),
  globals: [Header, Footer, SiteConfig, Sidebar],
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

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
