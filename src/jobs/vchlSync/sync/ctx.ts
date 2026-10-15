import type { Payload } from 'payload'

import type { AhlClient } from '@/ahl'

import { captureFailure, type VchlStage } from '../sentry'
import type { VchlChanges, VchlDiffEntry, VchlSettings, VchlTrigger, VchlWarning } from '../types'

/**
 * Sdílený stav jednoho běhu. Zápisy jdou VÝHRADNĚ přes `create`/`update`
 * odtud: v nanečisto režimu nezapíšou nic a všude jinde přidají k zápisu
 * `disableRevalidate` (revalidaci dělá běh jednou na konci).
 */
export type SyncContext = {
  payload: Payload
  client: AhlClient
  trigger: VchlTrigger
  dry: boolean
  settings: VchlSettings
  now: Date
  /** `teams` slug `muzi` */
  teamId: number
  warnings: VchlWarning[]
  diff: VchlDiffEntry[]
  changes: VchlChanges
  /** počet skutečných zápisů (revalidace se spouští jen při > 0) */
  writes: number
  /** chyby dílčích částí — jejich přítomnost znamená status `partial` */
  partialErrors: string[]
  sentryEventIds: string[]
  warn(w: VchlWarning): void
  recordDiff(e: VchlDiffEntry): void
  create(
    collection: string,
    data: Record<string, unknown>,
  ): Promise<{ id: number } & Record<string, unknown>>
  update(
    collection: string,
    id: number,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>
  /** Zachytí chybu do Sentry a poznamená ji; běh pokračuje (status `partial`). */
  partialFailure(err: unknown, stage: VchlStage, where?: Parameters<typeof captureFailure>[3]): void
}

export type SyncContextInit = Pick<
  SyncContext,
  'payload' | 'client' | 'trigger' | 'settings' | 'now' | 'teamId'
> & {
  changes: VchlChanges
}

type Loose = {
  create(a: unknown): Promise<{ id: number } & Record<string, unknown>>
  update(a: unknown): Promise<Record<string, unknown>>
}

export function createSyncContext(init: SyncContextInit): SyncContext {
  const loose = init.payload as unknown as Loose
  const seen = new Set<string>()
  const dry = init.trigger === 'dry'

  const ctx: SyncContext = {
    ...init,
    dry,
    warnings: [],
    diff: [],
    writes: 0,
    partialErrors: [],
    sentryEventIds: [],
    warn(w) {
      const key = `${w.type}:${w.ref ?? w.message}`
      if (seen.has(key)) return
      seen.add(key)
      ctx.warnings.push(w)
    },
    recordDiff(e) {
      ctx.diff.push(e)
    },
    async create(collection, data) {
      // V nanečisto vrací placeholder bez id — navazující kroky s tím počítají.
      if (dry) return { id: NaN, ...data }
      ctx.writes += 1
      return loose.create({ collection, data, depth: 0, context: { disableRevalidate: true } })
    },
    async update(collection, id, data) {
      if (dry) return { id, ...data }
      ctx.writes += 1
      return loose.update({ collection, id, data, depth: 0, context: { disableRevalidate: true } })
    },
    partialFailure(err, stage, where) {
      ctx.partialErrors.push(err instanceof Error ? err.message : String(err))
      const id = captureFailure(err, stage, init.trigger, where)
      if (id) ctx.sentryEventIds.push(id)
    },
  }
  return ctx
}
