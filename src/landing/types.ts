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
}

/** Karta reportu odehraného zápasu (sekce Sezóna). */
export type MatchReport = {
  id: number
  title: string
  /** Např. „8. 3. · Play-off". */
  badge: string
  score: string
  suffix: '' | 'sn' | 'pp'
  photo: Photo | null
}

/** Řádek výčtu nadcházejících zápasů. */
export type Fixture = {
  id: number
  dateLabel: string
  timeLabel: string
  title: string
  home: boolean
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
}

/** Výsledek zápasu z pohledu HC Čestice. */
export type Outcome = 'win' | 'draw' | 'loss'

/** Karta rozlosování na /zapasy. */
export type FixtureCard = {
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
}

/** Řádek výpisu odehraných zápasů na /zapasy. */
export type ResultRow = {
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
  /** Štítky pod článkem (tituly kategorií). */
  tags: string[]
  showRelated: boolean
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
export type StandingsRow = { pos: number; team: string; games: number; points: number }

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
  reports: MatchReport[]
  fixtures: Fixture[]
  sponsors: Sponsor[]
  /** Počet hráčů aktuální sezóny (hero „24 hráčů"). */
  playerCount: number
}
