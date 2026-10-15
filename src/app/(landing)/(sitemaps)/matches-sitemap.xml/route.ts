import { CACHE_TAGS } from '@/landing/data/tags'
import { routes } from '@/lib/routes'

import { sitemapRoute } from '../sitemapRoute'

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
export const GET = sitemapRoute({
  collection: 'matches',
  tag: CACHE_TAGS.matchesSitemap,
  path: routes.match,
  limit: 2000,
})
