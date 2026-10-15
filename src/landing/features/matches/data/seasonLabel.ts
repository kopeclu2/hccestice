import type { Season } from '@/payload-types'

/** „2025/26" ze startYear (title „2025 – 2026" by dal „2025/2026"). */
export const seasonShortLabel = (season: Pick<Season, 'startYear'>): string =>
  `${season.startYear}/${String(season.startYear + 1).slice(2)}`
