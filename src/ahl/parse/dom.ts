import { JSDOM } from 'jsdom'

import { fold } from '@/lib/fold'

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
  const m = raw
    .replace(/ /g, ' ')
    .trim()
    .match(/^-?\d+/)
  return m ? Number.parseInt(m[0], 10) : null
}

export function requireInt(raw: string, page: string, what: string): number {
  const n = toInt(raw)
  if (n === null)
    throw new AhlParseError(page, `${what}: očekáváno číslo, nalezeno „${raw.trim()}"`)
  return n
}

export function paramFromHref(href: string | null | undefined, param: string): number | null {
  if (!href) return null
  const m = href.match(new RegExp(`[?&]${param}=(\\d+)`))
  return m ? Number.parseInt(m[1], 10) : null
}

/** Dvouciferné doplnění nulou pro `YYYY-MM-DDTHH:mm`. */
export const pad2 = (n: number): string => String(n).padStart(2, '0')

/**
 * Dvojice „3 : 1" na začátku řetězce. Zbytek za druhým číslem (přípona
 * `pp`/`sn`, doplněk v tabulce) vrací v `rest`, aby si ho volající
 * vyhodnotil sám: výpis výsledků ho chce přesně, tabulka týmů ho ignoruje.
 */
export function parseScorePair(raw: string): { home: number; away: number; rest: string } | null {
  const m = raw
    .replace(/ /g, ' ')
    .trim()
    .match(/^(\d+)\s*:\s*(\d+)(.*)$/s)
  return m ? { home: +m[1], away: +m[2], rest: m[3].trim() } : null
}

export function phaseFromCompetition(raw: string): 'regular' | 'playoff' | 'other' {
  const s = fold(raw)
  if (/play-?off|\bpo\b|\b[cs]f\b|finale|\bo 3\b|prkl/.test(s)) return 'playoff'
  if (/\bzc\b|zakladni cast/.test(s)) return 'regular'
  return 'other'
}
