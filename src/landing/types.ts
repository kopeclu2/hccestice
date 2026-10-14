/**
 * View-modely landing page.
 *
 * Sekce nikdy nesahají přímo na Payload dokumenty — dostávají tyto úzké,
 * již připravené tvary dat (viz `queries.ts`). Díky tomu jsou komponenty
 * čitelné, snadno testovatelné a nezávislé na tvaru CMS.
 */

/**
 * Položka hlavní navigace.
 *
 * Rozpojuje tři role, které dřív plnil jediný string `href` v `NAV_LINKS`
 * (cíl odkazu, `id` sekce v DOM, klíč aktivního stavu). Výsledný href se
 * odvozuje podle kontextu renderu — viz `navHref()` v `data/navigation.ts`.
 */
export type NavItem = {
  label: string
  /** `id` sekce na homepage, bez `#`. `null` = sekce na home není. */
  anchor: string | null
  /** Cesta na podstránku. `null` = položka žije jen jako kotva na home. */
  path: string | null
}

/** Zvýrazněné tlačítko vpravo v navigaci (na home i podstránkách). */
export type NavCta = {
  label: string
  /** `#kotva` nebo `/cesta`; kotva se na podstránkách doplní na `/#kotva`. */
  href: string
}

/** Obrázek připravený pro `next/image` (relativní URL z Payload media). */
export type Photo = {
  url: string
  alt: string
  width: number
  height: number
  /**
   * Verze souboru pro cache-buster v URL (`getMediaUrl(url, updatedAt)`).
   * Bez ní nejde na média nasadit `Cache-Control: immutable` — výměna
   * souboru pod stejným názvem by se návštěvníkům neprojevila.
   */
  updatedAt?: string | null
}

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
  suffix: '' | 'sn' | 'pp'
  dateLabel: string
  won: boolean
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Milník timeline na /historie-klubu. */
export type Milestone = {
  key: string
  /** Text kvůli neurčitým letopočtům („70. léta"). */
  year: string
  title: string
  text: string
  /** Bez fotky se polaroid blok nevykreslí. */
  photo: Photo | null
}

/** Éra timeline — sekční nadpis s rozsahem let a svými milníky. */
export type HistoryEra = {
  value: string
  title: string
  range: string
  milestones: Milestone[]
}

/** Sponzor z CMS — marquee pás na homepage i řádková karta na /sponzori. */
export type Sponsor = {
  id: number
  name: string
  url: string | null
  logo: Photo | null
  /** Kontaktní osoba — jen u partnerů, kde ji klub eviduje. */
  person: string | null
  address: string | null
  phone: string | null
  email: string | null
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
  suffix: '' | 'sn' | 'pp'
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Výsledek zápasu z pohledu HC Čestice. */
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

/** Karta rozlosování na /zapasy. */
export type FixtureCard = MatchSchemaFields & {
  id: number
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
export type ResultRow = MatchSchemaFields & {
  id: number
  /** „15. 3." */
  dateLabel: string
  stage: string
  title: string
  venue: string | null
  /** Skóre v pořadí domácí : hosté. */
  score: string
  suffix: '' | 'sn' | 'pp'
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
  suffix: '' | 'sn' | 'pp'
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

/** Karta widgetu Články. */
export type PostCard = {
  id: number
  title: string
  href: string | null
  dateLabel: string
  tag: string
  /** Úryvek pro textové karty — perex, SEO popis, nebo začátek obsahu. */
  excerpt: string | null
  photo: Photo | null
}

/** Karta widgetu Galerie a výpisu /fotogalerie. */
export type GalleryCard = {
  id: number
  title: string
  dateLabel: string
  photoCount: number
  cover: Photo | null
  /** Odkaz na detail (`/fotogalerie/{slug}`); widgety ho nevyplňují. */
  href?: string | null
  /** Krátký štítek sezóny („2025/26"); widgety ho nevyplňují. */
  seasonLabel?: string | null
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
  suffix: '' | 'sn' | 'pp'
  won: boolean | null
  /** Odkaz na reportáž (`/aktuality/{slug}`), pokud je nalinkovaná. */
  reportHref: string | null
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = zápas bez slugu. */
  href: string | null
}

/** Hráč ve widgetu Soupiska. */
export type RosterPlayer = {
  id: number
  name: string
  number: number | null
  position: string | null
  photo: Photo | null
}

/** Kontakty a sociální sítě z globalu `siteConfig`. */
export type SiteLinks = {
  email: string
  facebook: string | null
  instagram: string | null
}

/** Karta osoby (kolekce `people` vybraná v landing globalu). */
export type PersonCard = {
  name: string
  role: string
  note: string | null
  mail: string | null
  phone: string | null
  photo: Photo | null
}

/* ── Detail článku (/aktuality/[slug]) ───────────────────────────────────── */

/** Varianta hero hlavičky článku (Payload select, s fallbackem na `typograficke`). */
export type ArticleHeroVariant = 'foto' | 'rozdelene' | 'typograficke' | 'panel' | 'zapas'

/** Autor článku pro meta řádek a vizitku. */
export type ArticleAuthor = {
  name: string
  /** Iniciály do avataru, např. „LS". */
  initials: string
  role: string | null
  note: string | null
  email: string | null
  photo: Photo | null
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
  /** Třetiny „1:1" v pořadí domácí : hosté; prázdné = nezobrazovat. */
  thirds: string[]
  suffix: '' | 'sn' | 'pp'
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

/** Statistika hráče za sezónu — součet ze sestav odehraných zápasů. */
export type PlayerSeasonStat = {
  games: number
  goals: number
  assists: number
  pim: number
}

/** Kompletní view-model detailu článku. */
export type ArticleDetail = {
  id: number
  slug: string
  title: string
  /** Podčást titulku ke zvýraznění (lime); null = bez zvýraznění. */
  titleHighlight: string | null
  variant: ArticleHeroVariant
  /** Kategorie do badge a breadcrumbs, např. „Zápasy". */
  badge: string
  excerpt: string | null
  photo: Photo | null
  photoCaption: string | null
  dateLabel: string
  readingLabel: string
  author: ArticleAuthor
  scoreboard: ArticleScoreboard | null
  /** Odkaz na detail zápasu (`/zapasy/{slug}`); null = reportáž s zápasem nesouvisí. */
  matchHref: string | null
  /** Štítky pod článkem (tituly kategorií). */
  tags: string[]
  showRelated: boolean
}

/* ── Detail zápasu (/zapasy/[slug]) ──────────────────────────────────────── */

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
  /** Skóre úseku „1:1" v pořadí domácí : hosté; null = neznámé (nájezdy). */
  score: string | null
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
  /** Třetiny „1:1" v pořadí domácí : hosté. */
  thirds: string[]
  suffix: '' | 'sn' | 'pp'
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

/* ── Redakční obsah sekcí (global `landingPage` + fallbacky) ─────────────── */

export type HeroContent = {
  photo: Photo | null
  intro: string
  headlineLight: string
  headlineBold: string
  ctaLabel: string
}

/**
 * Hero varianta 2 (`blocks/HeroModern`). Tlačítko je tu celé v rukou CMS —
 * text, cíl i vzhled — a `null` znamená „správce ho vypnul", ne „chybí
 * data": proto ne `ctaLabel: string` jako u varianty 1, kde je cíl
 * zadrátovaný v komponentě.
 */
export type HeroModernContent = Omit<HeroContent, 'ctaLabel'> & {
  cta: { label: string; href: string; variant: 'dark' | 'light' | 'lime' } | null
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

export type StatsContent = {
  seasonLabel: string
  items: Array<{ value: string; label: string; accent: boolean }>
}

/** Jedna ledová hodina v rozpisu tréninků (karta v pásu). */
export type TrainingSlot = {
  day: string
  time: string
  /** Štítek skupiny („Muži", „Muži + mládež"). Prázdné = bez štítku. */
  group: string | null
  /** Místo — z řádku, jinak výchozí místo sekce. */
  venue: string | null
  /** Doplňková poznámka pod místem („Od 1. 11.", „Bez brankáře"). */
  note: string | null
  /** Zvýrazněná (tmavá) karta s lime štítkem. */
  accent: boolean
}

export type TrainingsContent = {
  kicker: string | null
  headline: string
  headlineHighlight: string
  headlineRest: string
  perex: string | null
  rows: TrainingSlot[]
}

export type ClubContent = {
  kicker: string
  headlineStart: string
  headlineHighlight: string
  perex: string
  ctaLabel: string
  stadium: { photo: Photo | null; tag: string; caption: string }
  youth: { photo: Photo | null; tag: string; caption: string }
  note: string
}

/** Velikost dlaždice v mozaice Fotoalba: 2×2, 2×1, 1×1. */
export type AlbumSpan = 'big' | 'wide' | 'tile'

/**
 * Dlaždice mozaiky Fotoalba. Overlaye se liší podle velikosti (handoff
 * „Modern"): velká nese lime badge i titulek, široká titulek, malá jen
 * glass štítek — proto jsou to tři nezávislá pole a ne jeden „label".
 */
export type AlbumTile = {
  span: AlbumSpan
  /**
   * Pevná pozice v mřížce (`col-start` / `row-start`) u připraveného vzoru;
   * `null` = dlaždice se umístí auto-placementem (ruční mozaika).
   */
  place: string | null
  photo: Photo | null
  /** Titulek přes fotku — velká a široká dlaždice. */
  title: string | null
  /** Štítek vlevo dole — malá dlaždice (sezóna, jinak datum). */
  chip: string | null
  /** Lime badge vlevo nahoře — jen velká dlaždice. */
  badge: string | null
  /** Cíl odkazu; `null` = dlaždice není klikatelná (album bez slugu). */
  href: string | null
  key: string
}

/** Sekce Historie na landingu — vyprávění, pilulky milníků a citát z kroniky. */
export type HistoryContent = {
  kicker: string
  watermark: string
  headlineStart: string
  headlineHighlight: string
  lead: string
  text: string
  metaLine: string
  ctaLabel: string
  photosCtaLabel: string
  /** Pilulky milníků; `accent` = lime (nejnovější milník). */
  chips: Array<{ label: string; accent: boolean }>
  quoteStart: string
  quoteHighlight: string
  quoteEnd: string
  quoteSource: string
}

export type FaqItem = { question: string; answer: string }

export type ContactContent = {
  kicker: string
  perex: string
  pills: string[]
  topics: string[]
}

export type FooterContent = {
  photo: Photo | null
  headline: string
  perex: string
  columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>
  league: string
}

/** Kompletní redakční obsah stránky (global `landingPage`). */
export type LandingContent = {
  hero: HeroContent
  reportPhotos: Array<Photo | null>
  standings: StandingsContent
  stats: StatsContent
  trainings: TrainingsContent
  club: ClubContent
  mosaic: AlbumTile[]
  history: HistoryContent
  people: { intro: string; cards: PersonCard[] }
  faq: FaqItem[]
  contact: ContactContent
  footer: FooterContent
}

/** Souhrn všech CMS dat, která landing page potřebuje. */
export type LandingData = {
  content: LandingContent
  site: SiteLinks
  upcoming: UpcomingMatch | null
  lastResult: LastResult | null
  sponsors: Sponsor[]
  /** Počet hráčů aktuální sezóny (hero „24 hráčů"). */
  playerCount: number
}
