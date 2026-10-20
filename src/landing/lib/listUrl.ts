export type ListUrlOptions = {
  /** Filtry výpisu (`typ`, `sezona`). Prázdné hodnoty (`null`, `undefined`, `''`) se vynechají. */
  filters?: Record<string, string | null | undefined>
  /** Strana výpisu; první strana do URL nepatří (`/aktuality`, ne `/aktuality?page=1`). */
  page?: number
  /**
   * Název query parametru stránkování. Výchozí `page`; `/zapasy` historicky
   * používá `strana`. URL jsou v indexu, takže se jméno nesjednocuje.
   */
  pageKey?: string
  /** Kotva bez `#` — patří do odkazů v UI, ne do `canonical`. */
  hash?: string
}

/**
 * Adresa výpisu s filtry a stránkováním v URL. Filtry jdou před stránkou
 * a filtr, který se nepředá, v adrese není — změna filtru tak vrací výpis
 * na první stranu.
 */
export function buildListUrl(
  base: string,
  { filters = {}, page = 1, pageKey = 'page', hash }: ListUrlOptions = {},
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }
  if (page > 1) params.set(pageKey, String(page))
  const query = params.toString()
  return `${base}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

/** Nejvyšší strana výpisu, kterou web vůbec zkusí načíst. */
export const MAX_LIST_PAGE = 500

/**
 * Číslo strany z query parametru (`?page=`, `?strana=`). Neplatná hodnota je
 * strana 1; horní mez je tu proto, že strana jde do klíče tagované cache
 * (`cachedQuery`) — bez ní by `?page=1`…`?page=99999999` zakládal entry
 * na každé číslo, které si skener vymyslí. Strana nad skutečným počtem
 * stran vrací prázdný výpis, takže mez nic neukrývá.
 *
 * `searchParams` mohou nést pole (`?page=2&page=3`); bere se první hodnota.
 */
export function parsePageParam(
  raw: string | readonly string[] | undefined,
  max: number = MAX_LIST_PAGE,
): number {
  const value = typeof raw === 'string' ? raw : raw?.[0]
  const page = Number.parseInt(value ?? '1', 10)
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.min(page, max)
}
