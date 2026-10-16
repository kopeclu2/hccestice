/**
 * Identita klubu — jediný zdroj pro jméno, logo a předpony názvů.
 *
 * Bez importů a bez serverových závislostí: používá to frontend, e-maily,
 * synchronizace VČHL i admin (klient).
 */

/** Název klubu, jak se píše v titulcích, e-mailech a v zápasech. */
export const CLUB_NAME = 'HC Čestice'

/** Název webu — v titulku stránky za svislítkem (`brandTitle`). Dnes shodný s klubem. */
export const SITE_NAME = CLUB_NAME

/** Logo klubu jako cesta v `public/` (absolutní URL si skládá volající). */
export const CLUB_LOGO = '/logo-cestice.png'

/**
 * Předpony názvů klubů, které o týmu nic neříkají („HC Zdar", „SK Žamberk").
 * Velkými písmeny; porovnává se bez ohledu na velikost (`teamName.ts`).
 *
 * Sjednocená sada ze tří dřívějších seznamů: monogram na tabuli měl šest,
 * hlavičky detailu osm a párování soupeřů v synchronizaci pět předpon.
 */
export const CLUB_PREFIXES = ['HC', 'HK', 'SK', 'TJ', 'HHK', 'ZH', 'HCM', 'SKP'] as const
