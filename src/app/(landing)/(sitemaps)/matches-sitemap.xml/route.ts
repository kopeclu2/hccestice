import { unstable_cache } from 'next/cache'
import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'

import config from '@payload-config'

/**
 * Sitemapa detailů zápasů (`/zapasy/[slug]`).
 *
 * Detail má smysl i u zápasu, který se ještě nehrál (rozlosování, odpočet,
 * soupeř), takže se nefiltruje podle `status` — do sitemapy jdou všechny
 * zápasy, které slug mají. Starší zápasy bez slugu (před migrací
 * `match_slug`) by neměly kam odkazovat.
 *
 * Kolekce `matches` **nemá verzování**, takže pole `_status` neexistuje
 * (stejně jako u `galleries`) a dotaz na něj by Payload odmítl. Viditelnost
 * řeší `access.read: anyone` + `overrideAccess: false`.
 */
const getMatchesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'matches',
      overrideAccess: false,
      depth: 0,
      limit: 2000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    return results.docs
      ? results.docs
          .filter((match) => Boolean(match?.slug))
          .map((match) => ({
            loc: `${SITE_URL}/zapasy/${match?.slug}`,
            lastmod: match.updatedAt || dateFallback,
          }))
      : []
  },
  ['matches-sitemap'],
  {
    tags: ['matches-sitemap'],
    // Pojistka pod tagem — bez ní má `unstable_cache` TTL jeden rok.
    revalidate: 86400,
  },
)

export async function GET() {
  const sitemap = await getMatchesSitemap()

  // Route handlery jsou dynamické by default, cachovaná je jen datová část.
  return getServerSideSitemap(sitemap, {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  })
}
