/** České skloňování: 1 / 2–4 / 5+. Bez serverových importů, použitelné i v adminu (klient). */
export const plural = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many
