export const SITE_NAME = 'HC Čestice'

/**
 * Přilepí název klubu k titulku stránky — ale **jen když tam ještě není**.
 *
 * Suffix se totiž dosazuje na dvou místech a jedno o druhém nevědělo:
 * `generateTitle` v `src/plugins/index.ts` ho předgeneruje do pole
 * `meta.title` v adminu (redaktor ho pak uloží jako součást hodnoty) a
 * `generateMeta` ho přidával podruhé. Výsledkem byly titulky typu
 * „Nové posily | HC Čestice | HC Čestice", které se v SERP ořezávaly.
 *
 * Odstranit suffix jen na jednom z těch míst nejde: dokumenty, kde si
 * redaktor titul napsal ručně bez brandingu, by o něj přišly úplně.
 * Proto tahle idempotentní funkce a proto ji používají obě místa.
 *
 * Test je `includes`, ne `endsWith`: homepage má v `meta.title` uloženo
 * „HC Čestice — hokejový klub | TJ Sokol Čestice", tedy branding na
 * **začátku**. S `endsWith` by se suffix přilepil znovu a duplicita by
 * zůstala. Vedlejší efekt je žádoucí — zápasové titulky jako
 * „HC Polička B x HC Čestice" už název klubu nesou a druhý ho jen
 * odsune za hranici, kterou SERP zobrazí.
 */
export const brandTitle = (title?: string | null): string => {
  const clean = (title ?? '').trim()

  if (!clean) return SITE_NAME

  return clean.includes(SITE_NAME) ? clean : `${clean} | ${SITE_NAME}`
}
