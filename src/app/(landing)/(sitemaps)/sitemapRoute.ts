import { getServerSideSitemap } from 'next-sitemap'
import type { Where } from 'payload'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS, type CacheTag } from '@/landing/data/tags'
import { getServerSideURL } from '@/lib/getURL'
import {
  buildSitemapEntries,
  redirectSourceSet,
  type SitemapDoc,
  type SitemapEntry,
} from '@/lib/sitemapEntries'

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
  /**
   * Dokument, který se do sitemapy nepíše (např. zápas bez času výkopu).
   * Pole `date` v dokumentu je jen s `selectDate`.
   */
  skipDoc?: (doc: SitemapDoc) => boolean
  /** Do `select` přidat `date` — jen kolekce, která pole má (`matches`). */
  selectDate?: boolean
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
  skipDoc,
  selectDate = false,
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
        select: { slug: true, updatedAt: true, ...(selectDate && { date: true }) },
      })

      // Jeden dotaz na všechna přesměrování, ne dotaz na každý dokument.
      // Dokument, jehož cesta je v `redirects.from`, se přesměruje (3xx),
      // takže do sitemapy nepatří. Čte se bez `overrideAccess: false`
      // stejně jako `getRedirects` — kolekci plní import, ne návštěvník.
      const { docs: redirects } = await payload.find({
        collection: 'redirects',
        depth: 0,
        limit: 0,
        pagination: false,
        select: { from: true },
      })

      return buildSitemapEntries({
        siteUrl,
        staticPaths,
        // `select` vrací jen `slug`, `updatedAt` a případně `date`; typ kolekce je unie.
        docs: docs as SitemapDoc[],
        path,
        excludeSlugs,
        redirectSources: redirectSourceSet(redirects.map(({ from }) => from)),
        skipDoc,
      })
    },
    // Tag kolekce redirectů navíc: změna přesměrování mění i sitemapu.
    { key: tag, version: 'v2', tags: [tag, CACHE_TAGS.redirects], revalidate: 86400 },
  )

  return async () => getServerSideSitemap(await getSitemap(), HEADERS)
}
