import type { ArticleScoreboard } from '@/landing/features/matches/types'
import type { Photo } from '@/landing/types'

/** View-modely článků (karta ve výpisu, detail) — skládají je mapovače ve `view/posts.ts`. */

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
