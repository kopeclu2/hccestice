import { CACHE_TAGS } from '@/landing/data/tags'
import { routes } from '@/lib/routes'

import { sitemapRoute } from '../sitemapRoute'

export const GET = sitemapRoute({
  collection: 'posts',
  tag: CACHE_TAGS.postsSitemap,
  path: routes.post,
  published: true,
  limit: 1000,
})
