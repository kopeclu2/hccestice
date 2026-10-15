import 'server-only'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'

export async function getRedirects(depth = 1) {
  const payload = await getPayloadClient()

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    depth,
    limit: 0,
    pagination: false,
  })

  return redirects
}

/**
 * Přesměrování se cachují všechna dohromady (jeden dotaz místo opakovaných)
 * pod tagem `redirects`, který invaliduje hook `revalidateRedirects`.
 */
const cachedRedirects = cachedQuery(async () => getRedirects(), {
  key: 'redirects',
  tags: [CACHE_TAGS.redirects],
})

export const getCachedRedirects = () => cachedRedirects
