import { toDate, utcToPragueLocal } from './datetime'

/**
 * Čisté funkce pro skládání položek sitemap — bez I/O, aby šly testovat
 * bez Payloadu (`sitemapRoute` je jen vyplní daty z databáze).
 */

/** Pole dokumentu, která sitemapa čte (`select` v `sitemapRoute`). */
export type SitemapDoc = {
  slug?: string | null
  updatedAt?: string | null
  /** Jen zápasy (`matches.date`) — ostatní kolekce pole nemají. */
  date?: string | null
}

export type SitemapEntry = { loc: string; lastmod?: string }

/**
 * Cesta v klíči množiny redirectů: bez okrajových mezer a bez koncového
 * lomítka (kromě kořene). Velikost písmen se **nemění** — `PayloadRedirects`
 * porovnává `from` přesně, takže stejné pravidlo musí platit tady.
 */
export const normalizeRedirectPath = (path: string): string => {
  const trimmed = path.trim()
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed
}

/**
 * Množina cest z kolekce `redirects` (pole `from`). Dokument, jehož cesta
 * v ní je, se uživateli neobslouží, ale přesměruje — v sitemapě by byl
 * 3xx a Search Console to hlásí jako chybu.
 */
export const redirectSourceSet = (froms: readonly (string | null | undefined)[]): Set<string> =>
  new Set(froms.flatMap((from) => (from ? [normalizeRedirectPath(from)] : [])))

/**
 * Zápas má reálný čas výkopu? Legacy a placeholder zápasy mají čas
 * `00:00` v Europe/Prague (zápas založený jen s dnem, viz
 * `resolveMatchDate` v synchronizaci VČHL). Chybějící nebo neplatné datum
 * čas nemá taky.
 */
export const hasKickoffTime = (date: string | null | undefined): boolean => {
  const parsed = date ? toDate(date) : null
  return parsed !== null && utcToPragueLocal(parsed).time !== '00:00'
}

/**
 * Zápas, který se do sitemapy nepíše: bez času výkopu (placeholder). Detail
 * existuje i pro něj, ale je to rozepsaná položka bez hodnoty pro vyhledávač.
 */
export const isUntimedMatch = (doc: SitemapDoc): boolean => !hasKickoffTime(doc.date)

type BuildOptions = {
  siteUrl: string
  /** Cesty bez dokumentu v CMS, vypsané před dokumenty (bez `lastmod`). */
  staticPaths?: readonly string[]
  docs: readonly SitemapDoc[]
  /** Cesta dokumentu podle slugu (`routes.post`, …). */
  path: (slug: string) => string
  /** Slugy s ruční routou — dokument by URL zdvojil. */
  excludeSlugs?: ReadonlySet<string>
  /** Cesty z `redirects` (`redirectSourceSet`). */
  redirectSources?: ReadonlySet<string>
  /** Další vyřazení dokumentu (zápas bez času). */
  skipDoc?: (doc: SitemapDoc) => boolean
}

/**
 * Položky sitemapy: statické cesty + dokumenty bez slugu, s ruční routou,
 * s redirectem nebo vyřazené `skipDoc`. Duplicitní URL se vypíše jednou
 * (první výskyt vyhrává; `staticPaths` tedy předčí dokument).
 */
export function buildSitemapEntries({
  siteUrl,
  staticPaths = [],
  docs,
  path,
  excludeSlugs,
  redirectSources,
  skipDoc,
}: BuildOptions): SitemapEntry[] {
  const entries: SitemapEntry[] = staticPaths.map((staticPath) => ({
    loc: `${siteUrl}${staticPath}`,
  }))

  for (const doc of docs) {
    const slug = doc.slug
    if (!slug || excludeSlugs?.has(slug) || skipDoc?.(doc)) continue
    const docPath = path(slug)
    if (redirectSources?.has(normalizeRedirectPath(docPath))) continue
    entries.push({
      loc: `${siteUrl}${docPath}`,
      ...(doc.updatedAt ? { lastmod: doc.updatedAt } : {}),
    })
  }

  const seen = new Set<string>()
  return entries.filter(({ loc }) => (seen.has(loc) ? false : (seen.add(loc), true)))
}
