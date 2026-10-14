/**
 * Typy výstupu parserů ahl.cz. Žádný z nich neví nic o Payloadu — mapování
 * na kolekce dělá až synchronizační job (fáze 2).
 */

export type AhlScoreSuffix = 'pp' | 'sn' | null

export type AhlPhase = 'regular' | 'playoff' | 'other'

export type AhlScore = { home: number; away: number; suffix: AhlScoreSuffix }

/** Řádek z `/rozpis/` nebo `/vysledky/`. */
export type AhlListMatch = {
  /** `zapasid` */
  matchId: number
  /**
   * Lokální čas Europe/Prague bez zóny, `YYYY-MM-DDTHH:mm:00`. Výpis výsledků
   * čas nemá — pak je `T00:00:00` a `timeKnown` je false. Do UTC to převádí
   * až job, parser DST neřeší.
   */
  dateISO: string
  timeKnown: boolean
  home: { name: string; participantId: number | null }
  away: { name: string; participantId: number | null }
  venue: string | null
  /** např. „VČHL 2.ročník - ZČ" */
  competition: string
  phase: AhlPhase
  score: AhlScore | null
  /** false, když odkaz má třídu `neni_zapis` nebo skóre chybí */
  hasReport: boolean
}

/** Jméno ve tvaru „Jméno Příjmení" bez přípon (JUN, S, SDor). */
export type AhlPersonRef = { name: string; playerId: number | null }

export type AhlGoal = {
  /** `mm:ss` od začátku zápasu (30:41 = 31. minuta) */
  time: string
  side: 'home' | 'away'
  /** zkratka týmu z AHL (CES, ZH) — jen informativně, strana je v `side` */
  teamCode: string
  scorer: AhlPersonRef
  assists: AhlPersonRef[]
  /** početní stav, např. `5/4`; null když chybí */
  strength: string | null
  /** stav po brance, např. `1:0` (domácí:hosté) */
  scoreAfter: string
}

export type AhlLineupRow = {
  playerId: number | null
  name: string
  number: number | null
  goalie: boolean
  goals: number
  assists: number
  points: number
  pim: number
}

export type AhlMatchDetail = {
  matchId: number
  dateISO: string | null
  venue: string | null
  competition: string
  phase: AhlPhase
  home: { name: string }
  away: { name: string }
  /** null u neodehraného zápasu (stránka pro něj ukazuje „0 : 0") */
  score: AhlScore | null
  /** třetiny (+ prodloužení jako 4. položka, pokud je uvedeno) */
  periods: { home: number; away: number }[]
  /** true, když stránka nese branky nebo sestavy */
  hasReport: boolean
  goals: AhlGoal[]
  lineups: { home: AhlLineupRow[]; away: AhlLineupRow[] }
}

/**
 * Sloupce tabulky na ahl.cz: Z, V, VP (výhra v prodl./nájezdech), R (v HTML
 * `tabulka_remizy`, ale v této lize je to PROHRA v prodl./nájezdech za 1 bod
 * — ověřeno: Čestice 2 sn prohry = 2 body, R=2), P.
 */
export type AhlStandingRow = {
  pos: number
  team: string
  participantId: number | null
  games: number
  wins: number
  otWins: number
  otLosses: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type AhlPlayerStat = {
  playerId: number | null
  name: string
  games: number
  goals: number
  assists: number
  points: number
  pim: number
  goalie: boolean
}

export type AhlCompetitionInfo = {
  competitionYearId: number
  label: string
  participants: { participantId: number; name: string }[]
}
