import type { ScorePair, ScoreSuffix } from '@/landing/features/matches/view/matchFormat'
import type { Photo } from '@/landing/types'

/** View-modely zápasů, sezón a tabulky — skládají je mapovače ve `view/` a fetchery v `data/`. */

/** Nejbližší naplánovaný zápas — pohání hero countdown. */
export type UpcomingMatch = {
  /** Např. „Aloha Lanškroun × HC Čestice" (domácí tým vlevo). */
  title: string
  /** ISO datum a čas úvodního buly (cíl countdownu). */
  kickoffISO: string
  /** Např. „7. února 17:00 · Zimní stadion Lanškroun". */
  subtitle: string
  /** Štítek nad názvem, např. „18. kolo VČHL". */
  label: string
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Poslední odehraný výsledek — fallback hero karty po konci sezóny. */
export type LastResult = {
  title: string
  /** Skóre z pohledu pořadí v `title` (domácí : hosté). */
  score: string
  /** Přípona skóre — „sn" / „pp", jinak prázdné. */
  suffix: ScoreSuffix
  dateLabel: string
  won: boolean
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Řádek widgetu Zápasy (výsledky i rozpis). */
export type MatchRow = {
  id: number
  dateLabel: string
  timeLabel: string
  title: string
  home: boolean
  /** Vyplněné jen u odehraných zápasů. */
  score: string | null
  suffix: ScoreSuffix
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/**
 * Výsledek z pohledu Čestic. `otLoss` = prohra po prodloužení nebo
 * nájezdech — v tabulce VČHL za ni je bod (sloupec R), proto má vlastní
 * „půlený" štítek, ne cihlový jako prohra v základní době.
 */
export type Outcome = 'win' | 'draw' | 'otLoss' | 'loss'

/**
 * Strojově čitelná podoba zápasu pro `SportsEvent`.
 *
 * `dateLabel`/`title` jsou pro člověka: „7. 2." nemá rok a titulek slepuje
 * oba týmy do jednoho řetězce. Strukturovaná data potřebují ISO datum
 * a týmy zvlášť, takže si je karty nesou vedle popisků — díky tomu se
 * schema staví z týchž dat, která se vykreslí, a nemůže se s nimi rozejít.
 */
export type MatchSchemaFields = {
  /** ISO 8601 včetně času — `Match.date` beze změny. */
  startDate: string
  homeName: string
  awayName: string
}

/** Znaky týmů v pořadí domácí / hosté; null = soupeř bez loga (monogram). */
export type TeamLogos = {
  homeLogo: Photo | null
  awayLogo: Photo | null
}

/** Karta rozlosování na /zapasy. */
export type FixtureCard = MatchSchemaFields &
  TeamLogos & {
    id: number
    /** „so" — zkratka dne v týdnu nad datem. */
    weekdayLabel: string
    /** „Doma" / „Venku" — pilulka v rohu karty. */
    kind: string
    /** Kolo nebo fáze soutěže, např. „19. kolo". */
    stage: string
    /** „7. 2." */
    dateLabel: string
    timeLabel: string
    title: string
    venue: string | null
    /** Nejbližší zápas — lime tečka „Nejbližší". */
    isNext: boolean
    /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
    href: string | null
  }

/** Řádek výpisu odehraných zápasů na /zapasy. */
export type ResultRow = MatchSchemaFields &
  TeamLogos & {
    id: number
    /** „so" — zkratka dne v týdnu nad datem. */
    weekdayLabel: string
    /** „15. 3." */
    dateLabel: string
    stage: string
    title: string
    venue: string | null
    /** Skóre v pořadí domácí : hosté. */
    score: string
    suffix: ScoreSuffix
    outcome: Outcome
    /** Naši střelci bez nájezdů, „Sajdl 2, Vacek"; null = zápis chybí. */
    scorers: string | null
    /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
    href: string | null
  }

/** Čtvereček formy (posledních 5 zápasů) i s obsahem tooltipu. */
export type FormSquare = {
  id: number
  /** „V" / „R" / „P". */
  letter: string
  outcome: Outcome
  score: string
  suffix: ScoreSuffix
  stage: string
  title: string
  dateLabel: string
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Forma HC Čestice — čtverečky zleva od nejstaršího a slovní bilance. */
export type TeamForm = {
  squares: FormSquare[]
  /** „4× výhra · 0× remíza · 1× prohra". */
  summary: string
}

/** Velká karta jednoho zápasu (widget Karta zápasu). */
export type MatchCardData = {
  id: number
  status: 'scheduled' | 'played' | 'canceled'
  dateLabel: string
  competition: string | null
  venue: string | null
  /** Hrajeme doma → Čestice vlevo. */
  home: boolean
  opponentName: string
  opponentLogo: Photo | null
  /** Skóre v pořadí domácí : hosté; null = ještě se nehrálo. */
  score: string | null
  suffix: ScoreSuffix
  won: boolean | null
  /** Odkaz na reportáž (`/aktuality/{slug}`), pokud je nalinkovaná. */
  reportHref: string | null
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Výsledková tabule hero varianty „zapas" (mapovaná z kolekce `matches`). */
export type ArticleScoreboard = {
  /** „Zápasové zpravodajství · Play-off o 3. místo". */
  kicker: string
  /** „Zimní stadion Rychnov n. K. · 14. března 2026". */
  metaLine: string
  homeName: string
  awayName: string
  /** Skóre v pořadí domácí : hosté. */
  homeScore: number
  awayScore: number
  weAreHome: boolean
  weWon: boolean
  /** Třetiny v pořadí domácí : hosté; prázdné = nezobrazovat. */
  thirds: ScorePair[]
  suffix: ScoreSuffix
  /** Průběh branek ze zápisu; prázdné = timeline se nevykreslí. */
  goals: ArticleGoal[]
}

/** Jedna branka v timeline reportáže. */
export type ArticleGoal = {
  /** „12:34". */
  time: string
  ours: boolean
  scorer: string
  /** Asistenti (0–2 jména). */
  assists: string[]
  /** Stav po brance v pořadí domácí : hosté. */
  score: string
  /** Přesilovka (PP) / oslabení (OS) z pohledu Čestic, nájezd; jinak null. */
  special: 'pp' | 'os' | 'sn' | null
}

/**
 * Událost na časové ose detailu zápasu. Gól soupeře nese jen stav — jména
 * střelce a asistentů v typu záměrně nejsou, aby nedoputovala do cache ani
 * do RSC payloadu (osa ukazuje jen události HC Čestice, soupeřův gól je
 * tam kvůli průběhu skóre).
 */
export type MatchTimelineEvent =
  | ({ type: 'goal'; ours: true } & Omit<ArticleGoal, 'ours'>)
  | { type: 'goal'; ours: false; time: string; score: string }
  | ({ type: 'penalty' } & MatchPenaltyRow)

/** Úsek časové osy: třetina, prodloužení, nájezdy. */
export type MatchTimelinePeriod = {
  label: string
  /** Skóre úseku v pořadí domácí : hosté; null = neznámé (nájezdy). */
  score: ScorePair | null
  events: MatchTimelineEvent[]
}

/** Trest hráče HC Čestice (soupeřovy tresty zápis do CMS neukládá). */
export type MatchPenaltyRow = {
  /** „12:34". */
  time: string
  player: string
  minutes: number | null
  /** „Menší trest", „Vyšší trest"… (text ze zápisu). */
  kind: string | null
  reason: string | null
}

/** Řádek statistiky v pořadí Čestice : soupeř. */
export type MatchStatRow = {
  label: string
  ours: string
  opp: string
  /** Čísla pro poměrový pruh; null = hodnota není číslo (čas „m:ss"), pruh se nekreslí. */
  oursValue: number | null
  oppValue: number | null
}

/** Reportáž u zápasu — sjednocená z `matches.report` a `posts.match`. */
export type MatchDetailReport = {
  title: string
  excerpt: string | null
  photo: Photo | null
  href: string
}

/** Kompletní view-model detailu zápasu. */
export type MatchDetail = {
  id: number
  slug: string
  status: 'scheduled' | 'played' | 'canceled'
  /** ISO úvodního buly (odpočet naplánovaného zápasu). */
  kickoffISO: string
  /** „12. října 2025". */
  dateLabel: string
  /** „17:00". */
  timeLabel: string
  venue: string | null
  /** Soutěž tak, jak je v CMS („VČHL — 18. kolo"); null = nevyplněno. */
  competition: string | null
  /** Krátký štítek fáze („18. kolo", „Semifinále"). */
  phase: string
  /** „HC Čestice × HC Zdar" (domácí × hosté). */
  title: string
  homeName: string
  awayName: string
  homeLogo: Photo | null
  awayLogo: Photo | null
  weAreHome: boolean
  /** Skóre v pořadí domácí : hosté; null = zápas není odehraný. */
  homeScore: number | null
  awayScore: number | null
  /** Třetiny v pořadí domácí : hosté. */
  thirds: ScorePair[]
  suffix: ScoreSuffix
  /** Výsledek z pohledu Čestic; null = zápas není odehraný. */
  outcome: Outcome | null
  /** Slug sezóny pro odkaz zpět na `/zapasy?sezona=…`; null = sezóna bez slugu. */
  seasonSlug: string | null
  seasonLabel: string | null
  /** Časová osa po třetinách (branky + naše tresty); prázdná = bez zápisu. */
  timeline: MatchTimelinePeriod[]
  /** Počet našich branek na ose (doplněk v hlavičce panelu). */
  goalsOurs: number
  penalties: MatchPenaltyRow[]
  /** Součet minut našich trestů. */
  penaltyMinutes: number
  stats: MatchStatRow[]
  /** Naši střelci jedním řádkem („Sajdl 2, Vacek") pro popis stránky; null = bez zápisu. */
  scorers: string | null
  report: MatchDetailReport | null
  gallery: { title: string; href: string } | null
  /** Odehraný zápas bez branek i trestů — stránka řekne, že zápis chybí. */
  missingProtocol: boolean
}

/** Řádek tabulky soutěže. */
export type StandingsRow = {
  pos: number
  team: string
  games: number
  points: number
  /** Rozšířená tabulka ze synchronizace — chybí u ručně vedených sezón. */
  wins?: number
  otWins?: number
  otLosses?: number
  losses?: number
  goalsFor?: number
  goalsAgainst?: number
}

export type StandingsContent = {
  seasonLabel: string
  fullTableUrl: string
  rows: StandingsRow[]
}
