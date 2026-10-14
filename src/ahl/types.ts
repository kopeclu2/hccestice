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

export type AhlPenalty = {
  /** `m:ss` / `mm:ss` od začátku zápasu */
  time: string
  side: 'home' | 'away'
  /** zkratka týmu z AHL (CES, ZH) — jen informativně, strana je v `side` */
  teamCode: string
  /** null = řádek bez odkazu na hráče (trest lavice / trenéra) */
  player: AhlPersonRef | null
  /**
   * Jméno z buňky Hráč, když v ní není odkaz (`displayName` bez přípon) — ať
   * se u trestu bez `hracid` neztratí, kdo ho dostal. S odkazem nebo u prázdné
   * buňky null (jméno pak nese `player`).
   */
  playerText: string | null
  /** Kód před pomlčkou: číslo („2", „5") nebo písmenný kód („OK"); neznámý formát → null */
  code: string | null
  /** „2 - Menší trest" → 2, „OK - Trest do konce utkání" → 20; neznámý kód nebo formát → null */
  minutes: number | null
  /** Text za pomlčkou („Menší trest"); neznámý formát → celý surový text */
  kind: string
  /** prázdný důvod → null */
  reason: string | null
}

export type AhlPair = { home: number; away: number }

/**
 * Tabulka „Statistika zápasu". Všechny hodnoty jsou v pořadí domácí:hosté
 * (ověřeno proti počtu trestů po stranách). Chybí-li řádek nebo je nečitelný,
 * je null — jsou to vedlejší data a nestojí za pád běhu. Střely tu záměrně
 * nejsou: když je rozhodčí nevyplní, stránka ukazuje 0:0, takže hodnota
 * nerozliší „žádná střela" od „nevyplněno".
 */
export type AhlMatchStats = {
  /** Vyloučení */
  penalties: AhlPair | null
  /** Vyšší tresty */
  majors: AhlPair | null
  /** Využití přesilovek (góly) */
  ppGoals: AhlPair | null
  /** Čas v PP, `m:ss` */
  ppTime: { home: string; away: string } | null
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
  /**
   * Tresty obou stran; u neodehraného zápasu `[]`. Null = tabulka Tresty je
   * nečitelná (důvod v `penaltiesError`). Tresty jsou vedlejší data, takže
   * jejich chyba nesmí zahodit branky a sestavy ani zablokovat zápas, který
   * by se jinak donekonečna stahoval znovu.
   */
  penalties: AhlPenalty[] | null
  /** Zpráva `AhlParseError` z parsování trestů; null při úspěchu a u neodehraného zápasu. */
  penaltiesError: string | null
  stats: AhlMatchStats
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
