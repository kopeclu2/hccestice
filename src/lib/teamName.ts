import { CLUB_PREFIXES } from './club'

/**
 * Zkratky z názvů týmů a osob: monogram do kroužku, třípísmenný kód jako
 * na TV tabuli, iniciály a očištění od klubové předpony.
 *
 * Čisté funkce bez serverových importů — používá je klient (tabule,
 * hlavičky zápasu) i synchronizace VČHL.
 */

const PREFIX_SET: ReadonlySet<string> = new Set(CLUB_PREFIXES)

/** Předpona na začátku názvu, za kterou následuje mezera („HC Zdar"). */
const leadingPrefixRe = (prefixes: readonly string[]): RegExp =>
  new RegExp(`^(?:${prefixes.join('|')})\\s+`, 'i')

const DEFAULT_LEADING_PREFIX_RE = leadingPrefixRe(CLUB_PREFIXES)

const words = (name: string): string[] => name.split(/\s+/).filter(Boolean)

/** První slovo, které není klubová předpona; záloha první slovo, pak „?". */
const keyWord = (name: string): string => {
  const all = words(name)
  return all.find((word) => !PREFIX_SET.has(word.toUpperCase())) ?? all[0] ?? '?'
}

/**
 * Název bez úvodní klubové předpony: „HC Polička B" → „Polička B".
 * Odstraní jen jednu předponu a jen když za ní něco zůstane („HC" samotné
 * se nemění). Velikost písmen vstupu zůstává, takže funguje i na názvu
 * po `fold` („hc policka b" → „policka b").
 *
 * `prefixes` přebije výchozí sadu `CLUB_PREFIXES`; potřebuje ji kód, který
 * porovnává názvy mezi systémy a nesmí se tiše změnit s širší sadou pro web.
 */
export const stripClubPrefix = (
  name: string,
  prefixes: readonly string[] = CLUB_PREFIXES,
): string => {
  const re = prefixes === CLUB_PREFIXES ? DEFAULT_LEADING_PREFIX_RE : leadingPrefixRe(prefixes)
  return name.trim().replace(re, '')
}

/** Písmeno do kroužku u týmu bez loga: „HC Zdar" → „Z". */
export const monogram = (name: string): string => keyWord(name).charAt(0).toUpperCase()

/** Třípísmenná zkratka jako na TV tabuli: „HC Polička B" → „POL". */
export const teamCode = (name: string): string =>
  keyWord(name).slice(0, 3).toLocaleUpperCase('cs-CZ')

export type InitialsOptions = {
  /** Kolik prvních slov se bere. Výchozí 2. */
  words?: number
  /** Přeskočit slova končící tečkou („st.", „ml.", „s.r.o."). */
  skipAbbreviations?: boolean
  /** Velká písmena. Výchozí `true`; `false` zachová velikost z názvu. */
  upper?: boolean
}

/**
 * Iniciály prvních slov jména: „Lukáš Sajdl" → „LS". Slova se dělí
 * libovolnými bílými znaky, prázdná se ignorují. Prázdný vstup dává `''`.
 */
export const initials = (name: string, opts: InitialsOptions = {}): string => {
  const { words: count = 2, skipAbbreviations = false, upper = true } = opts
  const picked = words(name)
    .filter((word) => !(skipAbbreviations && word.endsWith('.')))
    .slice(0, count)
    .map((word) => word.charAt(0))
    .join('')
  return upper ? picked.toUpperCase() : picked
}
