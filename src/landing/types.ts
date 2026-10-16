/**
 * Sdílené jádro view-modelů landing page — tvary, které používá víc features
 * a bloků naráz (`Photo`, `PersonCard`, `SiteLinks`, obsah hero/patičky…).
 *
 * Sekce nikdy nesahají přímo na Payload dokumenty — dostávají úzké, již
 * připravené tvary dat. Typy jedné domény žijí vedle ní:
 * `features/<doména>/types.ts` (fetchery v `data`, mapovače ve `view`,
 * pomocníky nad dokumenty v `lib/`).
 */

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

export type FaqItem = { question: string; answer: string }

export type FooterContent = {
  photo: Photo | null
  headline: string
  perex: string
  columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>
  league: string
}
