/**
 * Záměrně bez importů: sdílí se i s frontendem, takže se sem nesmí dostat
 * jsdom ani nic serverového.
 */

function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// AHL má pro Čestice tři podoby: krátký název ve výpisech, plný v tabulce
// a třípísmennou zkratku v zápise.
const OUR_TEAM = new Set(['cestice', 'hc cestice', 'ces'])

export function isOurTeam(name: string | null | undefined): boolean {
  if (!name) return false
  return OUR_TEAM.has(fold(name))
}
