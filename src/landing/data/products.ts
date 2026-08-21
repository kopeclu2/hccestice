import type { Product } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/** Produkty (merch) — fetchery pro widgety Produkty a Karta produktu. */

/** Produkty v nabídce (available), seřazené dle pořadí. */
export const fetchProducts = cache(async (): Promise<Product[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { available: { equals: true } },
    sort: 'order',
    limit: 0,
    depth: 1,
  })
  return docs
})

/** Jeden produkt (i nedostupný — karta ho může ukázat s upozorněním). */
export const fetchProduct = cache(async (productId: number): Promise<Product | null> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findByID({ collection: 'products', id: productId, depth: 1 })
})

/** Produkt podle slugu — pro detail stránku /produkty/{slug}. */
export const fetchProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

/** Slugy všech produktů — pro generateStaticParams detailu. */
export const fetchProductSlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    limit: 0,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
})
