import type { Photo } from '@/landing/types'

/** View-modely historie klubu (timeline a sekce na landingu). */

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
