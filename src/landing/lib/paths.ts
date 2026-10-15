/** URL detailů — jediný zdroj pravdy pro odkazy na články a zápasy. */

/** URL detailu článku. Jediný zdroj pravdy — používá `postHref` i reporty zápasů. */
export const postPath = (slug: string | null | undefined): string | null =>
  slug ? `/aktuality/${slug}` : null

/** URL detailu zápasu (`/zapasy/{slug}`). Zápas bez slugu detail nemá. */
export const matchPath = (slug: string | null | undefined): string | null =>
  slug ? `/zapasy/${slug}` : null
