export const AHL_BASE_URL = 'https://www.ahl.cz/soutez/vychodoceska_hokejova_liga'

// Ověřeno curl-em 14. 10. 2026: `limit=500` stačí na celou sezónu
// (rozpis i výsledky mají jeden řádek na zápas, bez stránkování).
export function rozpisUrl(competitionYearId: number): string {
  return `${AHL_BASE_URL}/rozpis/?souteznirocnikid=${competitionYearId}&limit=500`
}

export function vysledkyUrl(competitionYearId: number): string {
  return `${AHL_BASE_URL}/vysledky/?souteznirocnikid=${competitionYearId}&limit=500`
}

export function zapasUrl(matchId: number): string {
  return `${AHL_BASE_URL}/zapas/?zapasid=${matchId}`
}

/** `/tabulky/` ročník vybírá `souteznirocnikid` (bez něj bere aktuální). */
export function tabulkyUrl(competitionYearId: number): string {
  return `${AHL_BASE_URL}/tabulky/?souteznirocnikid=${competitionYearId}`
}

/**
 * Statistiky mají jiný název parametru než ostatní stránky: pole
 * `souteznirocnikids[]`. Bez `ucastniksouteznihorocnikuid` vrací celou ligu
 * (350 kB), proto je tým povinný.
 */
export function statistikyUrl(competitionYearId: number, participantId: number): string {
  return (
    `${AHL_BASE_URL}/statistiky/?ucastniksouteznihorocnikuid=${participantId}` +
    `&souteznirocnikids[]=${competitionYearId}&limit=500`
  )
}

export function ucastnikUrl(participantId: number): string {
  return `${AHL_BASE_URL}/ucastnici/?&ucastniksouteznihorocnikuid=${participantId}`
}
