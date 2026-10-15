import 'server-only'

import { unstable_cache } from 'next/cache'

import { getPayloadClient } from '@/landing/data/query'
import { documentTag } from '@/landing/data/tags'
import type { Config } from '@/payload-types'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayloadClient()

  const page = await payload.find({
    collection,
    depth,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(async () => getDocument(collection, slug), [collection, slug], {
    tags: [documentTag(collection, slug)],
    // Pojistka pod tagem — bez ní má `unstable_cache` TTL jeden rok.
    revalidate: 3600,
  })
