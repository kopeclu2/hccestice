import { JSDOM } from 'jsdom'

import { AhlParseError } from '../errors'

export function parseDocument(html: string, page: string): Document {
  if (!html || html.trim().length < 200) {
    throw new AhlParseError(page, 'prázdná nebo příliš krátká odpověď')
  }
  // Bez `runScripts` jsdom skripty nespouští — stránky jich mají plno (jQuery).
  return new JSDOM(html).window.document
}

export function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').replace(/[\s ]+/g, ' ').trim()
}

export function toInt(raw: string | null | undefined): number | null {
  if (raw == null) return null
  const m = raw.replace(/ /g, ' ').trim().match(/^-?\d+/)
  return m ? Number.parseInt(m[0], 10) : null
}

export function requireInt(raw: string, page: string, what: string): number {
  const n = toInt(raw)
  if (n === null) throw new AhlParseError(page, `${what}: očekáváno číslo, nalezeno „${raw.trim()}"`)
  return n
}

export function paramFromHref(href: string | null | undefined, param: string): number | null {
  if (!href) return null
  const m = href.match(new RegExp(`[?&]${param}=(\\d+)`))
  return m ? Number.parseInt(m[1], 10) : null
}

/**
 * Mapa „název sloupce → index" z řádku záhlaví. Záhlaví nese uvnitř
 * `<span class="show_if_large">Zápasy</span><span class="show_if_small">Z</span>`,
 * takže se porovnává přes `includes` na spojeném textu i přes třídu `th`.
 */
export function headerCells(table: Element): Element[] {
  const row = table.querySelector('tr.tabulka_radek_nadpis')
  return row ? Array.from(row.querySelectorAll('th')) : []
}

export function phaseFromCompetition(raw: string): 'regular' | 'playoff' | 'other' {
  const s = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
  if (/play-?off|\bpo\b|\b[cs]f\b|finale|\bo 3\b|prkl/.test(s)) return 'playoff'
  if (/\bzc\b|zakladni cast/.test(s)) return 'regular'
  return 'other'
}
