import type { CollectionSlug } from 'payload'

/**
 * Jediný zdroj URL veřejného webu. Cesty se jmenují česky, kolekce
 * anglicky (`/aktuality/{slug}` je kolekce `posts`), takže se jedna z druhé
 * nedají odvodit a dřív byly opsané v deseti souborech (náhled, redirecty,
 * rich text, sitemapy, hooky).
 *
 * Bez serverových importů (`payload` jen jako typ) — používá to klient
 * i admin. Funkce nepoužívají `this`, takže jdou předat jako argument
 * (`linkOrNull(routes.match, slug)`).
 *
 * Slug se **nekóduje**: slugy kolekcí jsou URL-bezpečné už z principu
 * (`slugifyCs`, `slugify` Payloadu). Kdo bere slug z cizího vstupu (náhled),
 * zakóduje si ho sám.
 */
export const routes = {
  /** Domovská stránka — dokument `pages` se slugem `home` žije na `/`. */
  home: '/',
  /** Detail článku. */
  post: (slug: string): string => `/aktuality/${slug}`,
  /** Detail zápasu. */
  match: (slug: string): string => `/zapasy/${slug}`,
  /** Detail fotoalba. */
  gallery: (slug: string): string => `/fotogalerie/${slug}`,
  /** Detail produktu. */
  product: (slug: string): string => `/produkty/${slug}`,
  /**
   * Stránka z kolekce `pages` — `/{slug}`. Bez slugu a slug `home` je
   * domovská stránka (`/`), ne `/home`.
   */
  page: (slug?: string | null): string => (!slug || slug === 'home' ? '/' : `/${slug}`),
  /** Výpisy (plně dynamické routy, viz AGENTS.md „Cache a renderovací režimy"). */
  list: {
    posts: '/aktuality',
    matches: '/zapasy',
    galleries: '/fotogalerie',
  },
} as const

/**
 * Odkaz, který dokument bez slugu nemá: `null` místo `/aktuality/undefined`.
 * `linkOrNull(routes.match, match.slug)`.
 */
export const linkOrNull = (
  route: (slug: string) => string,
  slug: string | null | undefined,
): string | null => (slug ? route(slug) : null)

/**
 * URL prefix kolekcí, jejichž dokumenty mají na webu vlastní adresu.
 * `pages` mají prefix prázdný (žijí na `/[slug]`). Kolekce, které tu nejsou
 * (`media`, `users`, `redirects`…), veřejnou adresu nemají.
 *
 * Je to `Partial`, ne `Record<CollectionSlug, string>`: 29 kolekcí a jen pět
 * z nich má veřejné URL, zbytek by musel dostat vymyšlenou hodnotu.
 * Z řetězce (`relationTo` z rich textu nebo redirectu) se dokument
 * odkazuje přes `collectionDocPath`.
 */
export const collectionPrefix: Partial<Record<CollectionSlug, string>> = {
  pages: '',
  posts: routes.list.posts,
  galleries: routes.list.galleries,
  matches: routes.list.matches,
  products: '/produkty',
}

/**
 * Cesta dokumentu podle slugu kolekce — pro rich text a redirecty, kde je
 * `relationTo` jen řetězec. Neznámá kolekce se chová jako `pages`
 * (`/{slug}`), stejně jako dřívější odkazy v rich textu.
 */
export const collectionDocPath = (relationTo: string, slug: string): string =>
  `${collectionPrefix[relationTo as CollectionSlug] ?? ''}/${slug}`

/**
 * První segment URL → kolekce (`aktuality` → `posts`); opak `collectionPrefix`.
 * Pro admin bar, který z cesty poznává, kterou kolekci právě prohlížíte.
 * `pages` v mapě nejsou — nemají segment.
 */
export const collectionBySegment: Readonly<Record<string, CollectionSlug>> = Object.fromEntries(
  Object.entries(collectionPrefix)
    .filter(([, prefix]) => prefix)
    .map(([collection, prefix]) => [prefix!.slice(1), collection as CollectionSlug]),
)
