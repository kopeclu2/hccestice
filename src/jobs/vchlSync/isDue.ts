import type { VchlMode, VchlSettings } from './types'

export type DueMatch = {
  date: string | Date
  status: 'scheduled' | 'played' | 'canceled' | string | null | undefined
  hasReport: boolean | null | undefined
}

export type IsDueInput = {
  now: Date
  /** začátek posledního skutečného běhu (ne `dry`, ne `skipped`) */
  lastRunAt: Date | string | null
  settings: Pick<
    VchlSettings,
    'idleIntervalHours' | 'matchdayIntervalMinutes' | 'matchdayWindowHours'
  >
  ourMatches: DueMatch[]
  /** po chybě se zkouší znovu v rychlém intervalu, ne až za `idleIntervalHours` */
  lastRunStatus?: string | null
}

export type IsDueResult = { due: boolean; mode: VchlMode; nextDueAt: Date }

const MIN = 60_000
const HOUR = 3_600_000

/**
 * Tik cronu chodí v pětiminutové mřížce a běh sám trvá vteřiny, takže
 * `lastRunAt + 15 min` je vždy o pár stovek ms POZDĚJI než další tik —
 * bez tolerance by se běh s intervalem 15 min potkal s tikem až za 20 min.
 */
const SLACK_MS = 60_000

/**
 * Zápasový režim: od začátku zápasu Čestic po `matchdayWindowHours`, dokud
 * zápas není odehraný se zápisem. Jinak klidový.
 */
export function isDue({ now, lastRunAt, settings, ourMatches, lastRunStatus }: IsDueInput): IsDueResult {
  const nowMs = now.getTime()
  const windowMs = settings.matchdayWindowHours * HOUR

  const matchday = ourMatches.some((m) => {
    const start = new Date(m.date).getTime()
    if (!Number.isFinite(start)) return false
    if (nowMs < start || nowMs > start + windowMs) return false
    return m.status !== 'played' || !m.hasReport
  })
  const mode: VchlMode = matchday ? 'matchday' : 'idle'

  const fast = settings.matchdayIntervalMinutes * MIN
  let interval = matchday ? fast : settings.idleIntervalHours * HOUR
  if (lastRunStatus === 'error') interval = Math.min(interval, fast)

  if (!lastRunAt) return { due: true, mode, nextDueAt: now }
  const last = new Date(lastRunAt).getTime()
  if (!Number.isFinite(last)) return { due: true, mode, nextDueAt: now }

  const nextDueAt = new Date(last + interval)
  return { due: nowMs >= nextDueAt.getTime() - SLACK_MS, mode, nextDueAt }
}
