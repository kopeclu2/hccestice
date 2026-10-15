import { CACHE_TAGS } from '@/landing/data/tags'
import { routes } from '@/lib/routes'

import { sitemapRoute } from '../sitemapRoute'

/**
 * Sitemapa detailů fotoalb (`/fotogalerie/[slug]`).
 *
 * Tyhle stránky jsou veřejné a prolinkované z homepage i z `/fotogalerie`,
 * ale do žádné sitemapy se nedostaly: `pages-sitemap` čte kolekci `pages`,
 * `posts-sitemap` kolekci `posts` a index odkazoval jen na tyhle dvě.
 * Pro vyhledávače byly galerie orphaned.
 *
 * Proti `posts-sitemap.xml` chybí filtr `published` — kolekce `galleries`
 * **nemá verzování**, takže pole `_status` neexistuje a dotaz na něj by
 * Payload odmítl (`QueryError: The following path cannot be queried`).
 * Viditelnost řeší `access.read: anyone` + `overrideAccess: false`.
 */
export const GET = sitemapRoute({
  collection: 'galleries',
  tag: CACHE_TAGS.gallerySitemap,
  path: routes.gallery,
  limit: 1000,
})
