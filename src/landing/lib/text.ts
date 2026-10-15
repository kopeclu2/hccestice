/** České skloňování počtů. */

/** „hráč" / „hráči" / „hráčů" — formy [1, 2–4, 5+]; 0 bere formu 5+. */
export const pluralForm = (n: number, forms: [string, string, string]): string =>
  n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2]

/** „1 hráč" / „3 hráči" / „24 hráčů" — formy [1, 2–4, 5+]. */
export const countLabel = (n: number, forms: [string, string, string]): string =>
  `${n} ${pluralForm(n, forms)}`
