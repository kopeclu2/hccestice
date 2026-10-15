import type { Media, Product } from '@/payload-types'

/**
 * Hlavní fotka + galerie → jednotný seznam pro mřížku.
 *
 * `updatedAt` je součást seznamu, protože se z něj skládá URL a média
 * jdou s `Cache-Control: immutable` (viz `collections/Media.ts`) —
 * bez verze v URL by se výměna souboru návštěvníkům neprojevila.
 */
export type ProductPhoto = { url: string; alt: string; updatedAt?: string | null }

export function collectPhotos(product: Product): ProductPhoto[] {
  const photos: ProductPhoto[] = []
  if (typeof product.photo === 'object' && product.photo?.url) {
    photos.push({
      url: product.photo.url,
      alt: product.photo.alt ?? '',
      updatedAt: product.photo.updatedAt,
    })
  }
  for (const row of product.gallery ?? []) {
    const image = row.image as Media | number
    if (typeof image === 'object' && image?.url) {
      photos.push({ url: image.url, alt: image.alt ?? '', updatedAt: image.updatedAt })
    }
  }
  return photos
}
