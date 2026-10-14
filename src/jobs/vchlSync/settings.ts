import type { Payload } from 'payload'

import type { VchlSettings } from './types'

export const DEFAULT_SETTINGS: VchlSettings = {
  enabled: false,
  parts: { schedule: true, results: true, matchDetail: true, standings: true, draftPosts: false },
  idleIntervalHours: 6,
  matchdayIntervalMinutes: 15,
  matchdayWindowHours: 48,
  notifications: { notifyOn: ['failure', 'new-entity', 'rescheduled'], recipients: [], failureThreshold: 2 },
}

const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d)
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d)

/**
 * Global nemusí v DB existovat (nikdo ho ještě neuložil), takže každá
 * hodnota má default. Výchozí `enabled: false` je záměr — nasazení kódu nesmí
 * samo začít přepisovat zápasy.
 */
export async function loadSettings(payload: Payload): Promise<VchlSettings> {
  const g = await payload.findGlobal({ slug: 'vchl-sync', depth: 0 })
  const d = DEFAULT_SETTINGS
  return {
    enabled: bool(g?.enabled, d.enabled),
    parts: {
      schedule: bool(g?.parts?.schedule, d.parts.schedule),
      results: bool(g?.parts?.results, d.parts.results),
      matchDetail: bool(g?.parts?.matchDetail, d.parts.matchDetail),
      standings: bool(g?.parts?.standings, d.parts.standings),
      draftPosts: bool(g?.parts?.draftPosts, d.parts.draftPosts),
    },
    idleIntervalHours: num(g?.timing?.idleIntervalHours, d.idleIntervalHours),
    matchdayIntervalMinutes: num(g?.timing?.matchdayIntervalMinutes, d.matchdayIntervalMinutes),
    matchdayWindowHours: num(g?.timing?.matchdayWindowHours, d.matchdayWindowHours),
    notifications: {
      notifyOn: Array.isArray(g?.notifications?.notifyOn) ? g.notifications.notifyOn : d.notifications.notifyOn,
      recipients: Array.isArray(g?.notifications?.recipients)
        ? g.notifications.recipients.map((r) => r.email).filter(Boolean)
        : [],
      failureThreshold: num(g?.notifications?.failureThreshold, d.notifications.failureThreshold),
    },
  }
}
