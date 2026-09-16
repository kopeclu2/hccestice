import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

/**
 * Záložní OG obrázek pro dokumenty bez vlastní `meta.image`.
 * Sdílí ho i `generateMeta`, aby fallback žil na jednom místě.
 */
export const OG_FALLBACK_IMAGE = '/logo-cestice.png'

/**
 * Výchozí Open Graph pro celý web. `generateMeta` přepíše `title`,
 * `description`, `images` a `url` podle dokumentu — ale `siteName`, `type`
 * a `locale` se berou odsud, takže se propisují na každou stránku.
 *
 * Dřív tu zůstaly hodnoty Payload šablony („Payload Website Template",
 * „An open-source website built with Payload and Next.js.") a šly do OG tagů
 * všech ~380 stránek, takže každá sdílená karta na sítích nesla jméno šablony.
 */
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'cs_CZ',
  siteName: 'HC Čestice',
  title: 'HC Čestice — TJ Sokol Čestice',
  description:
    'Vesnický hokej ve Východočeské hokejové lize. Zápasy, výsledky, soupiska a fotky z Čestic.',
  images: [
    {
      url: `${getServerSideURL()}${OG_FALLBACK_IMAGE}`,
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}

/**
 * Výchozí Twitter/X karta pro celý web. Metadata Next slučuje **mělce** podle
 * segmentu (`docs/…/generate-metadata.md#merging`) — `twitter` je proto
 * samostatné pole, ne odvozené z `openGraph` za běhu. Bez něj sdílená karta
 * na X spadala na obecný náhled z URL místo na `summary_large_image` s OG
 * obrázkem klubu.
 */
export const defaultTwitter: Metadata['twitter'] = {
  card: 'summary_large_image',
  title: defaultOpenGraph?.title,
  description: defaultOpenGraph?.description,
  images: defaultOpenGraph?.images,
}
