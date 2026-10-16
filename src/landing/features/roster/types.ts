import type { Photo } from '@/landing/types'

/** View-modely soupisky. */

/** Hráč ve widgetu Soupiska. */
export type RosterPlayer = {
  id: number
  name: string
  number: number | null
  position: string | null
  photo: Photo | null
}

/** Statistika hráče za sezónu — součet ze sestav odehraných zápasů. */
export type PlayerSeasonStat = {
  games: number
  goals: number
  assists: number
  pim: number
}
