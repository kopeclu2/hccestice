import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

/** Slugy obsluhované landing routami v `app/(landing)` — viz filtr níže. */
const LANDING_SLUGS = new Set([
  'soupiska',
  'aktuality',
  'fotogalerie',
  'sponzori',
  'historie-klubu',
  'zapasy',
])

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    /**
     * Ručně psané landing routy — v kolekci `pages` nemají dokument, takže je
     * nelze odvodit z dat.
     *
     * Dřív tu byly i `/search` a `/posts` ze Payload šablony: první dnes vrací
     * 404 a druhá 308 na `/aktuality`. Sitemapa, která inzeruje 404, je chyba
     * v Search Console, a redirect v sitemapě Google reportuje zvlášť.
     * Naopak `/zapasy` tu vůbec nebylo, i když je to veřejná stránka.
     *
     * `/vzory` a `/widgety` sem nepatří — to jsou interní katalogy (noindex).
     */
    /**
     * `lastmod` tu záměrně **není**. Podle sitemap protokolu je volitelný,
     * a dosazovat sem `new Date()` znamenalo, že těchto šest URL hlásilo
     * změnu při **každém** requestu na sitemapu — bez ohledu na to, že se
     * obsah neměnil. Google tak dostával falešný signál a mezi sebou
     * nerozlišitelné časy (všech šest mělo identický timestamp).
     * Vynechat ho je korektnější než lhát.
     */
    const defaultSitemap = [
      { loc: `${SITE_URL}/soupiska` },
      { loc: `${SITE_URL}/zapasy` },
      { loc: `${SITE_URL}/aktuality` },
      { loc: `${SITE_URL}/fotogalerie` },
      { loc: `${SITE_URL}/sponzori` },
      { loc: `${SITE_URL}/historie-klubu` },
    ]

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          // Landing podstránky mají vlastní route (přebíjí [slug]) a jsou
          // ve výčtu výše — legacy dokument se stejným slugem by URL zdvojil.
          .filter((page) => !LANDING_SLUGS.has(page.slug as string))
          .map((page) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
