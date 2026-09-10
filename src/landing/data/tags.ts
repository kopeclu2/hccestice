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
  /** Global `siteConfig` — patička, kontakty, přepínače. */
  siteConfig: 'site-config',
  /** Výpis a filtry článků (`/aktuality`). */
  posts: 'posts-list',
  /** Výpis, filtry a mozaika galerií (`/fotogalerie`). */
  galleries: 'galleries-list',
  /** Rozlosování, výsledky a forma (`/zapasy`). */
  matches: 'matches-list',
} as const

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
