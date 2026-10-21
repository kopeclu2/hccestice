import type { Metadata } from 'next'

import { brandTitle } from './brandTitle'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph, OG_FALLBACK_IMAGE } from './mergeOpenGraph'

/**
 * Metadata ručně psaných rout (`/aktuality`, `/soupiska`, `/kontakt`, …),
 * které nejsou dokumenty v CMS a `generateMeta` se na ně nehodí.
 *
 * Dřív měla každá jen `title`, `description` a `canonical`. Open Graph a
 * Twitter pak zdědily obecné hodnoty z layoutu (Next slučuje metadata
 * **mělce** po segmentech), takže každá podstránka sdílená na síti nesla
 * `og:title` „HC Čestice — TJ Sokol Čestice" a `og:url` chyběl úplně.
 * Tady se `title`, `description` a adresa skládají jednou a jdou do tagů
 * všech tří vrstev, takže `og:url` je vždy shodné s canonicalem.
 *
 * - `title` stačí bez značky, `brandTitle` je idempotentní.
 * - `path` je canonical včetně případných parametrů výpisu (`?page=2`);
 *   `og:url` z něj vzniká jako absolutní adresa.
 * - `image` je cesta (`/…`) nebo absolutní URL; bez ní se použije logo klubu.
 * - `robots` jen tam, kde se liší od výchozího (strana 2+ výpisů).
 */
export function buildPageMetadata(args: {
  title: string
  description: string
  path: string
  image?: string
  robots?: Metadata['robots']
}): Metadata {
  const { description, image, path, robots } = args
  const title = brandTitle(args.title)

  const serverUrl = getServerSideURL()
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${serverUrl}${image}`
    : `${serverUrl}${OG_FALLBACK_IMAGE}`
  const images = [{ url: imageUrl }]

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: mergeOpenGraph({ description, images, title, url: `${serverUrl}${path}` }),
    // Vlastní `twitter`, ne dědění z layoutu — viz komentář v `generateMeta`.
    twitter: { card: 'summary_large_image', description, images, title },
    ...(robots ? { robots } : {}),
  }
}
