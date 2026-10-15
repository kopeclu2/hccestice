/**
 * Cache tagy datové vrstvy — jediný zdroj pravdy pro `unstable_cache`
 * i pro revalidační hooky.
 *
 * Bez společného modulu se tagy zapisují jako volné stringy na dvou
 * místech (fetcher a hook) a překlep se projeví tím, že se obsah
 * v adminu „neaktualizuje" — bez chyby, bez logu, až do vypršení TTL.
 *
 * `revalidatePath` tyhle cache **nepokryje**: `/aktuality`, `/fotogalerie`
 * a `/zapasy` čtou `searchParams`, takže jsou plně dynamické a žádnou
 * cache entry routy nemají. Tag je u nich jediná funkční invalidace.
 */
export const CACHE_TAGS = {
  /* ── Datová vrstva webu (redakční obsah → `{ expire: 0 }`) ── */
  /** Global `siteConfig` — patička, kontakty, přepínače. */
  siteConfig: 'site-config',
  /** Výpis a filtry článků (`/aktuality`). */
  posts: 'posts-list',
  /** Výpis, filtry a mozaika galerií (`/fotogalerie`). */
  galleries: 'galleries-list',
  /** Rozlosování, výsledky a forma (`/zapasy`). */
  matches: 'matches-list',
  /** Menu na každé stránce (`features/navigation/data.ts`). */
  navigation: 'navigation',
  /** Přepínač režimu údržby (`landing/data/maintenance.ts`). */
  maintenance: 'maintenance',
  /** Přesměrování z kolekce `redirects` (`server/getRedirects.ts`). */
  redirects: 'redirects',

  /* ── Crawlerské feedy (stale-while-revalidate `'max'` stačí) ── */
  /** `/llms.txt`. */
  llmsTxt: 'llms-txt',
  /** `/posts-sitemap.xml`. */
  postsSitemap: 'posts-sitemap',
  /** `/pages-sitemap.xml`. */
  pagesSitemap: 'pages-sitemap',
  /** `/gallery-sitemap.xml`. */
  gallerySitemap: 'gallery-sitemap',
  /** `/matches-sitemap.xml`. */
  matchesSitemap: 'matches-sitemap',

  /* ── Dědictví Payload šablony: hooky je invalidují, ale žádná cache je netaguje ── */
  globalHeader: 'global_header',
  globalFooter: 'global_footer',
} as const

/** Libovolný tag z `CACHE_TAGS` — typ pro `unstable_cache` i revalidační hooky. */
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Tag jednoho dokumentu (`server/getDocument.ts`): `pages_home`. Jediný
 * dynamický tag v repu, proto je mimo `CACHE_TAGS` (nelze ho vyjmenovat).
 */
export const documentTag = (collection: string, slug: string): string => `${collection}_${slug}`

/**
 * Tagy, které se invalidují spolu s landing stránkami
 * (hook `revalidateLanding`).
 *
 * Invaliduje se **všechno naráz**, ne per kolekce. Sezóny a zápasy
 * krmí tytéž výpisy, `siteConfig` je na každé stránce a redakční změna
 * je řádově jedna za den — přesnější rozpad by ušetřil jeden dotaz do
 * Postgresu a vykoupil to čtyřmi místy, kde se dá zapomenout tag přidat.
 */
export const LANDING_CACHE_TAGS = [
  CACHE_TAGS.siteConfig,
  CACHE_TAGS.posts,
  CACHE_TAGS.galleries,
  CACHE_TAGS.matches,
] as const
