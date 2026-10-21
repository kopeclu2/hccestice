import { routes } from './routes'

/**
 * Pravidla pro staré adresy z eStránek (`/clanky/*`, `/fotoalbum/*`) — čistá
 * logika bez I/O, aby šla testovat bez Payloadu. Rozhoduje se tu jen, **na co
 * se zeptat** kolekce `redirects` a **kam poslat adresu, která v ní není**;
 * dotaz a samotné přesměrování dělají routy.
 *
 * Proč to existuje: import zakládal přesměrování jen z „ploché" adresy
 * `/clanky/<název>.html`, ale starý web znal i zanořené
 * `/clanky/archivy/2015---2016/muzi/zapasy/<název>.html` (191 zápasových
 * reportáží) a indexové stránky sekcí (`/clanky/archivy/`, `…/celkove-vysledky/`,
 * `/fotoalbum/2006---2007/`), které nemají na novém webu přímý protějšek.
 */

/**
 * Kandidáti na shodu v `redirects.from`, od nejpřesnějšího: celá adresa a pak
 * plochá `/clanky/<poslední segment>`. Poslední segment je název článku a ten
 * import zakládal jako klíč; přesná shoda má vždy přednost.
 */
export function legacyClankyCandidates(segments: readonly string[]): string[] {
  if (segments.length === 0) return []
  const full = `/clanky/${segments.join('/')}`
  const last = segments[segments.length - 1]
  const flat = `/clanky/${last}`
  return segments.length > 1 && last ? [full, flat] : [full]
}

/**
 * Kam poslat adresu `/clanky/*`, která nemá žádné přesměrování. Jen pro
 * **indexové stránky** sekcí (bez `.html`): starý web v nich vypisoval články,
 * takže jejich nástupcem je výpis. Stránka s `.html` je konkrétní článek, který
 * v databázi chybí — ta má zůstat 404, aby se ztráta dala najít.
 */
export function legacyClankyFallback(segments: readonly string[]): string | null {
  const last = segments[segments.length - 1] ?? ''
  if (/\.html?$/i.test(last)) return null

  const path = segments.join('/')
  if (/celkove-vysledky|tabulka|rozlosovani|o-zapasech|zapasy/.test(path))
    return routes.list.matches
  if (/soupiska/.test(path)) return '/soupiska'
  return routes.list.posts
}

/**
 * Kam poslat adresu `/fotoalbum/*` bez přesměrování: výpis fotogalerií. Jen
 * indexy (sezóna, kategorie); detail fotky (`…jpg.html`) se řeší nejdelším
 * prefixem alba a bez alba zůstane 404. `__admin__` je interní úložiště
 * editoru starého webu (loga, fotky hráčů), na novém webu veřejný protějšek
 * nemá.
 */
export function legacyFotoalbumFallback(segments: readonly string[]): string | null {
  const last = segments[segments.length - 1] ?? ''
  if (/\.html?$/i.test(last)) return null
  if (segments[0] === '__admin__') return null
  return routes.list.galleries
}
