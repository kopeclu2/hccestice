import { getServerSideSitemap } from 'next-sitemap'
import type { Where } from 'payload'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import type { CacheTag } from '@/landing/data/tags'
import { getServerSideURL } from '@/lib/getURL'

type SitemapEntry = { loc: string; lastmod?: string }

type SitemapRouteOptions = {
  collection: 'posts' | 'pages' | 'galleries' | 'matches'
  /** Tag z `CACHE_TAGS`; z hooku ho invaliduje `revalidate*` profilem `'max'`. */
  tag: CacheTag
  /** Cesta dokumentu podle slugu (`routes.post`, …). */
  path: (slug: string) => string
  /**
   * Jen publikované dokumenty (`draft: false` + `_status: published`). Jen pro
   * kolekce s verzováním — u ostatních pole `_status` neexistuje a Payload by
   * dotaz odmítl; viditelnost tam řeší `access.read` + `overrideAccess: false`.
   */
  published?: boolean
  limit: number
  /** Slugy, které se vynechají (dokument má v appce vlastní ruční routu). */
  excludeSlugs?: ReadonlySet<string>
  /**
   * Cesty bez dokumentu v CMS, které se vypíšou před dokumenty. Bez `lastmod`:
   * je volitelný a dosazovat `new Date()` by znamenalo hlásit změnu při
   * každém requestu.
   */
  staticPaths?: readonly string[]
}

const HEADERS = {
  // Route handlery jsou dynamické by default, takže se handler spustí na
  // každý request — cachovaná je jen jeho datová část. Bez téhle hlavičky
  // by odpověď neměla `Cache-Control` vůbec.
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

/**
 * Route handler sitemapy jedné kolekce. Datová část je tagovaná cache
 * (`unstable_cache` bez `revalidate` žije rok, proto TTL 24 h pod tagem
 * jako pojistka při selhaném hooku).
 */
export function sitemapRoute({
  collection,
  tag,
  path,
  published = false,
  limit,
  excludeSlugs,
  staticPaths = [],
}: SitemapRouteOptions): () => Promise<Response> {
  const getSitemap = cachedQuery(
    async (): Promise<SitemapEntry[]> => {
      const payload = await getPayloadClient()
      const siteUrl = getServerSideURL()
      const where: Where | undefined = published ? { _status: { equals: 'published' } } : undefined

      const { docs } = await payload.find({
        collection,
        overrideAccess: false,
        ...(published && { draft: false, where }),
        depth: 0,
        limit,
        pagination: false,
        select: { slug: true, updatedAt: true },
      })

      return [
        ...staticPaths.map((staticPath) => ({ loc: `${siteUrl}${staticPath}` })),
        ...docs
          .filter((doc) => doc.slug && !excludeSlugs?.has(doc.slug))
          .map((doc) => ({ loc: `${siteUrl}${path(doc.slug as string)}`, lastmod: doc.updatedAt })),
      ]
    },
    { key: tag, tags: [tag], revalidate: 86400 },
  )

  return async () => getServerSideSitemap(await getSitemap(), HEADERS)
}
