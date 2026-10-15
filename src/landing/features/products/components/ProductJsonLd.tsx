import React from 'react'

import type { ProductPhoto } from '@/landing/features/products/photos'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import type { Product } from '@/payload-types'

/** `Product` + `Offer` JSON-LD — objednávky běží e-mailem, ne košíkem, proto
 *  `Offer` bez `url` na checkout; `availability` je pak hlavní signál. */
export function ProductJsonLd({ product, photos }: { product: Product; photos: ProductPhoto[] }) {
  const baseUrl = getServerSideURL()
  const path = `/produkty/${product.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(photos.length
      ? { image: photos.map((photo) => `${baseUrl}${getMediaUrl(photo.url, photo.updatedAt)}`) }
      : {}),
    url: `${baseUrl}${path}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CZK',
      price: product.price,
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}${path}`,
      seller: { '@type': 'Organization', name: 'HC Čestice' },
    },
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
