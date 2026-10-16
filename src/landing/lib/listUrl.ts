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
