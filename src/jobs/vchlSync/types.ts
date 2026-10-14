import type { Payload } from 'payload'

import type { Match, VchlSyncRun } from '@/payload-types'

export type { VchlSyncRun }

export type VchlTrigger = 'cron' | 'manual' | 'dry'

export type VchlMode = 'matchday' | 'idle'

export type VchlChanges = {
  matchesCreated: number
  matchesUpdated: number
  playersCreated: number
  playersUpdated: number
  opponentsCreated: number
  standingsUpdated: number
  draftPosts: number
}

export const emptyChanges = (): VchlChanges => ({
  matchesCreated: 0,
  matchesUpdated: 0,
  playersCreated: 0,
  playersUpdated: 0,
  opponentsCreated: 0,
  standingsUpdated: 0,
  draftPosts: 0,
})

/** Shoduje se s možnostmi pole `warnings.type` v kolekci `vchl-sync-runs`. */
export type VchlWarningType =
  | 'unknown-player'
  | 'unknown-opponent'
  | 'ambiguous-player'
  | 'rescheduled'
  | 'missing-on-ahl'
  | 'stats-mismatch'
  | 'other'

export type VchlWarning = { type: VchlWarningType; message: string; ref?: string }

export type VchlDiffEntry = {
  entity: 'matches' | 'players' | 'opponents' | 'seasons' | 'posts'
  /** stabilní klíč entity: `ahl:46616`, `ahlPlayer:38010`, `season:21` */
  key: string
  /** čitelný popis pro výpis (soupeř + datum, jméno hráče…) */
  label?: string
  action: 'create' | 'update'
  fields: string[]
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export type VchlSettings = {
  enabled: boolean
  parts: {
    schedule: boolean
    results: boolean
    matchDetail: boolean
    standings: boolean
    draftPosts: boolean
  }
  idleIntervalHours: number
  matchdayIntervalMinutes: number
  matchdayWindowHours: number
  notifications: {
    notifyOn: string[]
    /** prázdné = kontaktní e-mail z Nastavení webu */
    recipients: string[]
    failureThreshold: number
  }
}

/** Zápas, který v tomto běhu přešel do stavu „odehráno" (podklad pro e-mail o výsledku). */
export type VchlPlayedNow = {
  matchId: number
  /** `2026-10-04 doma Pardubice` */
  label: string
  /** `5:6 sn` z pohledu Čestic; chybí, když ho diff nenesl */
  score?: string
}

export type VchlRunResult = {
  runId: number | string | null
  status: 'ok' | 'partial' | 'error' | 'skipped'
  skippedReason?: 'disabled' | 'not-due' | 'locked'
  mode: VchlMode
  changes: VchlChanges
  warnings: VchlWarning[]
  diff?: VchlDiffEntry[]
  /** jen u skutečných běhů; odvozeno z diffu zápasů (update, status → played) */
  playedNow?: VchlPlayedNow[]
  error?: string
  requests: number
  durationMs: number
}

export type VchlStatus = {
  enabled: boolean
  mode: VchlMode
  lastRun: VchlSyncRun | null
  nextDueAt: string | null
  running: boolean
}

export type MatchDoc = Match
export type { Payload }
