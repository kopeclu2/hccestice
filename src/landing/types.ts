/**
 * View-modely landing page.
 *
 * Sekce nikdy nesahají přímo na Payload dokumenty — dostávají tyto úzké,
 * již připravené tvary dat (skládají je fetchery a mapovače v `data/*`,
 * viz `data/format.ts`). Díky tomu jsou komponenty
 * čitelné, snadno testovatelné a nezávislé na tvaru CMS.
 */

/**
 * Položka hlavní navigace.
 *
 * Rozpojuje tři role, které dřív plnil jediný string `href` v `NAV_LINKS`
 * (cíl odkazu, `id` sekce v DOM, klíč aktivního stavu). Výsledný href se
 * odvozuje podle kontextu renderu — viz `navHref()` v `data/navHref.ts`.
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

/** Statistika hráče za sezónu — součet ze sestav odehraných zápasů. */
export type PlayerSeasonStat = {
  games: number
  goals: number
  assists: number
  pim: number
}

/* ── Detail zápasu (/zapasy/[slug]) ──────────────────────────────────────── */

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
