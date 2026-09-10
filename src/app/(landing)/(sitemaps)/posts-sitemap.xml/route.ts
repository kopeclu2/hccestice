import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'posts',
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

    const sitemap = results.docs
      ? results.docs
          .filter((post) => Boolean(post?.slug))
          .map((post) => ({
            loc: `${SITE_URL}/aktuality/${post?.slug}`,
            lastmod: post.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
    // Pojistka pod tagem — bez ní má `unstable_cache` TTL jeden rok.
    revalidate: 86400,
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  // Route handlery jsou od Next 15 dynamické by default, takže se handler
  // spustí na každý request — cachovaná je jen jeho datová část. Bez téhle
  // hlavičky by odpověď neměla `Cache-Control` vůbec.
  return getServerSideSitemap(sitemap, {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  })
}
