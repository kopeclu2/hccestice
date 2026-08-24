/**
 * Slugy, které obsluhuje ručně psaná routa v `app/(landing)`, a které
 * zároveň existují jako legacy dokument v kolekci `pages`.
 *
 * Next dá v routingu přednost statické routě před `[slug]`, takže CMS
 * dokument se stejným slugem se nikdy nevykreslí. Každý výpis, který
 * staví na kolekci `pages`, ho proto musí odfiltrovat — jinak inzeruje
 * URL dvakrát (jednou z kolekce, jednou z ručního výčtu).
 *
 * Výčet byl původně jen v `pages-sitemap.xml/route.ts`. `llms.txt` ho
 * neměl, takže `/sponzori` a `/historie-klubu` v něm figurovaly dvakrát —
 * proto sdílený modul a ne druhá kopie.
 */
export const LANDING_SLUGS = new Set([
  'soupiska',
  'aktuality',
  'fotogalerie',
  'sponzori',
  'historie-klubu',
  'zapasy',
])
