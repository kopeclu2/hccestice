import type { VchlDiffEntry, VchlRunResult, VchlWarning } from '@/jobs/vchlSync/types'

export type LinkedWarning = VchlWarning & { link?: { label: string; href: string } }

export type StatusPayload = {
  status: {
    enabled: boolean
    mode: 'matchday' | 'idle'
    nextDueAt: string | null
    running: boolean
    lastRun: {
      id: number | string
      trigger: string
      status: string
      startedAt: string
      finishedAt?: string | null
      changes?: unknown
      error: string | null
    } | null
  }
  runs: RunRow[]
  warnings: LinkedWarning[]
}

export type RunRow = {
  id: number | string
  trigger: string
  status: string
  startedAt: string
  finishedAt?: string | null
  requests?: number | null
  changes?: unknown
  warnings?: { type: string; message: string; ref?: string | null }[] | null
  error?: string | null
  sentryEventId?: string | null
}

export type RunPayload = Omit<VchlRunResult, 'warnings'> & { warnings: LinkedWarning[] }

export type DetectPayload = {
  season: { id: number | string; title: string }
  current: { competitionYearId: number | null; participantId: number | null }
  detected: { competitionYearId: number; participantId: number }
  changed: boolean
  saved: boolean
}

export type { VchlDiffEntry }
