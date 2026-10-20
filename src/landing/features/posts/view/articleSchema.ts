import { CLUB_NAME } from '@/lib/club'
import { toPragueIso } from '@/lib/datetime'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { routes } from '@/lib/routes'
import { idRef, schemaIds } from '@/lib/schemaOrg'
import type { Media } from '@/payload-types'

/**
 * Stavba schema.org `NewsArticle` — čistá funkce bez I/O, aby šla testovat
 * a aby validační skript (`scripts/check-jsonld.ts`) kontroloval tentýž tvar,
 * který jde do stránky.
 *
 * `publisher` je odkaz na `#team` z home (jedna entita napříč webem).
 * Autor článku bez přiřazené osoby je v CMS fallbackem na jméno klubu
 * (AHL koncepty reportáží) — takový „autor" není `Person`, ale klub, proto
 * se vypisuje jako `SportsTeam` s `@id` týmu.
 */

export type ArticleSchemaInput = {
  baseUrl: string
  slug: string
  headline: string
  description: string | null
  /** Absolutní URL obrázků, nejdřív čtvercový. */
  images: string[]
  publishedAt: string | null
  modifiedAt: string | null
  authorName: string
}

type MediaSize = { url?: string | null } | undefined

/**
 * Obrázky článku jako absolutní URL ve třech podobách, které Google u článku
 * doporučuje: čtverec (`square` 500×500), originál a `og` 1200×630 (blízko
 * 16:9). Varianty 4:3 Media kolekce nevyrábí. Bez fotky v článku (výchozí
 * obrázek ze `siteConfig`) zbývá jen `fallback`.
 */
export function articleImages({
  baseUrl,
  fallback,
  media,
}: {
  baseUrl: string
  fallback: { url: string; updatedAt?: string | null } | null
  media: Pick<Media, 'url' | 'updatedAt' | 'sizes'> | null
}): string[] {
  const version = media?.updatedAt ?? null
  const absolute = (url: string | null | undefined, tag: string | null | undefined) =>
    url ? `${baseUrl}${getMediaUrl(url, tag)}` : null
  const size = (name: 'square' | 'og'): MediaSize => media?.sizes?.[name]

  const urls = media
    ? [
        absolute(size('square')?.url, version),
        absolute(media.url, version),
        absolute(size('og')?.url, version),
      ]
    : [fallback ? absolute(fallback.url, fallback.updatedAt) : null]

  return [...new Set(urls.filter((url): url is string => Boolean(url)))]
}

export function toNewsArticle({
  authorName,
  baseUrl,
  description,
  headline,
  images,
  modifiedAt,
  publishedAt,
  slug,
}: ArticleSchemaInput) {
  const ids = schemaIds(baseUrl)
  const url = `${baseUrl}${routes.post(slug)}`
  const iso = (value: string | null) => (value ? (toPragueIso(value) ?? value) : null)
  const published = iso(publishedAt)
  const modified = iso(modifiedAt ?? publishedAt)

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author:
      authorName === CLUB_NAME
        ? { '@type': 'SportsTeam', '@id': ids.team, name: CLUB_NAME }
        : { '@type': 'Person', name: authorName },
    publisher: idRef(ids.team),
    isPartOf: idRef(ids.website),
    inLanguage: 'cs-CZ',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  }
}
