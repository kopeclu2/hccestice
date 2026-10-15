import { LANDING_SLUGS } from '@/landing/data/landingSlugs'
import { CACHE_TAGS } from '@/landing/data/tags'
import { routes } from '@/lib/routes'

import { sitemapRoute } from '../sitemapRoute'

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
 *
 * `lastmod` u nich záměrně **není** (viz `sitemapRoute`): všech sedm URL by
 * jinak hlásilo změnu při každém requestu, s identickým timestampem.
 */
const STATIC_PATHS = [
  '/soupiska',
  routes.list.matches,
  routes.list.posts,
  routes.list.galleries,
  '/sponzori',
  '/historie-klubu',
  '/treninky',
] as const

export const GET = sitemapRoute({
  collection: 'pages',
  tag: CACHE_TAGS.pagesSitemap,
  path: routes.page,
  published: true,
  limit: 1000,
  // Landing podstránky mají vlastní route (přebíjí [slug]) a jsou ve výčtu
  // výše — legacy dokument se stejným slugem by URL zdvojil.
  excludeSlugs: LANDING_SLUGS,
  staticPaths: STATIC_PATHS,
})
