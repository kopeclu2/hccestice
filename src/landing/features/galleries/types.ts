import type { Photo } from '@/landing/types'

/** View-modely fotogalerií. */

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
