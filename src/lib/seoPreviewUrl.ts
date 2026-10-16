import { getServerSideURL } from '@/lib/getURL'
import { collectionDocPath, routes } from '@/lib/routes'

/**
 * Adresa pro náhled ve výsledcích vyhledávání (pole SEO v adminu,
 * `@payloadcms/plugin-seo` → `generateURL`).
 *
 * Kolekci plugin předává jako `collectionSlug` (z klienta) a jako
 * `collectionConfig` (dohledaná na serveru); bere se, co je k dispozici.
 * Cestu skládá `lib/routes`, ne `/{slug}` — článek žije na
 * `/aktuality/{slug}`, takže `/{slug}` vedlo na neexistující adresu.
 * Stránka `home` je `/`, ne `/home`.
 */
export const seoPreviewUrl = ({
  collectionSlug,
  collectionConfig,
  slug,
}: {
  collectionSlug?: string
  collectionConfig?: { slug: string }
  slug?: string | null
}): string => {
  const url = getServerSideURL()
  if (!slug) return url

  const collection = collectionSlug ?? collectionConfig?.slug
  // `pages` a neznámá kolekce žijí na `/[slug]`; `collectionDocPath` je zná
  // jen pro kolekce s vlastním prefixem.
  const path =
    collection && collection !== 'pages' ? collectionDocPath(collection, slug) : routes.page(slug)

  return `${url}${path}`
}
