/** Typy navigace — resolvery cílů jsou v `navHref.ts`, fetchery v `data.ts`. */

/**
 * Položka hlavní navigace.
 *
 * Rozpojuje tři role, které dřív plnil jediný string `href` v `NAV_LINKS`
 * (cíl odkazu, `id` sekce v DOM, klíč aktivního stavu). Výsledný href se
 * odvozuje podle kontextu renderu — viz `navHref()` v `navHref.ts`.
 */
export type NavItem = {
  label: string
  /** `id` sekce na homepage, bez `#`. `null` = sekce na home není. */
  anchor: string | null
  /** Cesta na podstránku. `null` = položka žije jen jako kotva na home. */
  path: string | null
}

/** Zvýrazněné tlačítko vpravo v navigaci (na home i podstránkách). */
export type NavCta = {
  label: string
  /** `#kotva` nebo `/cesta`; kotva se na podstránkách doplní na `/#kotva`. */
  href: string
}
