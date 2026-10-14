export { isOurTeam } from './ourTeam'

// Přípony AHL u hráčů (JUN = junior, S = senior, SDor = senior dorost…).
const SUFFIX_RE = /^(JUN|S|SDOR|DOR|ST|ML)$/i

export type NameOrder = 'first-last' | 'last-first'

type Parts = { first: string; last: string }

function splitName(raw: string, order: NameOrder): Parts {
  // Přípona je v AHL oddělená víc mezerami („Kolář, Aleš   JUN"), proto se
  // ořízne dřív, než se mezery sloučí. Nbsp bere \s taky.
  const head = raw.trim().split(/\s{2,}/)[0] ?? ''
  let s = head.replace(/\s+/g, ' ').trim()

  if (s.includes(',')) {
    // Čárka má přednost před hintem: „Příjmení, Jméno".
    const idx = s.indexOf(',')
    return { last: s.slice(0, idx).trim(), first: s.slice(idx + 1).trim() }
  }

  let tokens = s.split(' ').filter(Boolean)
  // Přípona oddělená jen jednou mezerou („Sajdl Lukáš JUN").
  if (tokens.length > 2 && SUFFIX_RE.test(tokens[tokens.length - 1])) {
    tokens = tokens.slice(0, -1)
  }
  s = tokens.join(' ')
  if (tokens.length < 2) return { first: '', last: s }

  return order === 'first-last'
    ? { first: tokens.slice(0, -1).join(' '), last: tokens[tokens.length - 1] }
    : { last: tokens[0], first: tokens.slice(1).join(' ') }
}

/**
 * Klíč pro porovnání hráčů: bez diakritiky, lowercase, „jméno příjmení".
 * Bez čárky je formát AHL „Příjmení Jméno", proto je výchozí `last-first`;
 * „Lukáš Sajdl" z našeho CMS se musí předat s `first-last`.
 */
export function normalizeName(raw: string, order: NameOrder = 'last-first'): string {
  const { first, last } = splitName(raw, order)
  return `${first} ${last}`
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** „Sajdl, Lukáš" → „Lukáš Sajdl" (bez přípon, s diakritikou). */
export function displayName(raw: string, order: NameOrder = 'last-first'): string {
  const { first, last } = splitName(raw, order)
  return `${first} ${last}`.replace(/\s+/g, ' ').trim()
}
