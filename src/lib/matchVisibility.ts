import type { Where } from 'payload'

/**
 * Zápas skrytý na webu (`matches.hiddenOnWeb`): synchronizace tak označí zápas,
 * který z AHL zmizel. Každý veřejný dotaz na `matches` ho musí přidat do
 * `where`; `not_equals` bere i `NULL`, takže starší řádky projdou.
 */
export const VISIBLE_MATCH: Where = { hiddenOnWeb: { not_equals: true } }

export const isMatchHidden = (match: { hiddenOnWeb?: boolean | null }): boolean =>
  match.hiddenOnWeb === true
