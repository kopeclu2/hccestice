/**
 * České skloňování počtů. Bez serverových importů, použitelné i v adminu (klient).
 */

/** Tři tvary: 1 (hráč) / 2–4 (hráči) / 0 a 5+ (hráčů). */
export type PluralForms = readonly [one: string, few: string, many: string]

const rules = new Intl.PluralRules('cs')

/**
 * Tvar podle počtu přes `Intl.PluralRules('cs')`: `one` → první, `few` →
 * druhý, `many` (desetinná čísla) a `other` (0, 5+) → třetí.
 *
 * Počty jsou celá čísla. U desetinných dává Intl vždy třetí tvar
 * (1,5 → „many"), a stejně se chová `Math.abs` záporných: −1 je „one".
 * Dřívější ruční porovnání dávalo u 2,5 druhý tvar a u −1 třetí; nikdo
 * takový počet nepředává.
 */
export const plural = (n: number, forms: PluralForms): string => {
  const category = rules.select(n)
  return category === 'one' ? forms[0] : category === 'few' ? forms[1] : forms[2]
}

/** „1 hráč" / „3 hráči" / „24 hráčů" / „0 hráčů". Číslo bez oddělovače tisíců. */
export const countLabel = (n: number, forms: PluralForms): string => `${n} ${plural(n, forms)}`
