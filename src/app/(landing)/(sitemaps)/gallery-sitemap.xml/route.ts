import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

/**
 * Sitemapa detailů fotoalb (`/fotogalerie/[slug]`).
 *
 * Tyhle stránky jsou veřejné a prolinkované z homepage i z `/fotogalerie`,
 * ale do žádné sitemapy se nedostaly: `pages-sitemap` čte kolekci `pages`,
 * `posts-sitemap` kolekci `posts` a index odkazoval jen na tyhle dvě.
 * Pro vyhledávače byly galerie orphaned.
 *
 * Proti `posts-sitemap.xml` chybí filtr `_status: { equals: 'published' }` —
 * kolekce `galleries` **nemá verzování**, takže pole `_status` neexistuje a
 * dotaz na něj by Payload odmítl (`QueryError: The following path cannot be
 * queried`). Viditelnost řeší `access.read: anyone` + `overrideAccess: false`.
 */
const getGallerySitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'galleries',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    return results.docs
      ? results.docs
          .filter((gallery) => Boolean(gallery?.slug))
          .map((gallery) => ({
            loc: `${SITE_URL}/fotogalerie/${gallery?.slug}`,
            lastmod: gallery.updatedAt || dateFallback,
          }))
      : []
  },
  ['gallery-sitemap'],
  {
    tags: ['gallery-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getGallerySitemap()

  return getServerSideSitemap(sitemap)
}
