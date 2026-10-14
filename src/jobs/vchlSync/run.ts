import type { Payload } from 'payload'

import {
  AhlFetchError,
  AhlParseError,
  createAhlClient,
  parseMatchList,
  rozpisUrl,
  vysledkyUrl,
} from '@/ahl'
import type { AhlListMatch } from '@/ahl'

import { resolveSeasons, resolveTeamId, type SeasonCtx } from './context'
import { isDue } from './isDue'
import { notifyRun } from './notify'
import { revalidateAfterSync } from './revalidate'
import { breadcrumb, captureFailure, captureWarning, span } from './sentry'
import { loadSettings } from './settings'
import { createSyncContext, type SyncContext } from './sync/ctx'
import { createDraftPost } from './sync/draftPost'
import { syncSeasonMatches, type DraftCandidate, type SeasonLists, type SeasonMatchState } from './sync/matches'
import { createOpponentResolver } from './sync/opponents'
import { createPlayerResolver } from './sync/players'
import { syncStandings } from './sync/standings'
import { checkStats } from './sync/statsCheck'
import {
  emptyChanges,
  type VchlDiffEntry,
  type VchlMode,
  type VchlPlayedNow,
  type VchlRunResult,
  type VchlSettings,
  type VchlStatus,
  type VchlSyncRun,
  type VchlTrigger,
} from './types'

export type {
  VchlChanges,
  VchlDiffEntry,
  VchlMode,
  VchlRunResult,
  VchlSettings,
  VchlStatus,
  VchlTrigger,
  VchlWarning,
} from './types'

const RUN_RETENTION_DAYS = 60
/** Zámek starší než tohle je zapomenutý (visící běh) a nesmí blokovat navždy. */
const LOCK_STALE_MS = 15 * 60_000

/**
 * Zámek proti souběhu ručního běhu a cronu: in-process, ne v DB.
 *
 * Projekt běží v jednom Node procesu (stejný předpoklad jako cron úklidu
 * auditu v AGENTS.md). Při škálování na víc instancí by se běhy mohly
 * překrýt — pojistkou pak zůstávají `unique` indexy na `ahl.matchId`
 * a `ahlPlayerId` (souběh duplikát nevytvoří, zápis jen spadne).
 *
 * Stav je na `globalThis`, ne v modulové proměnné: Next v dev režimu
 * (Turbopack) bundluje instrumentation a route handlery zvlášť, takže by
 * každý měl vlastní kopii modulu a vlastní, navzájem neviditelný zámek.
 * Dotaz na `payload-jobs` (plán) nejde: tik sám je rozpracovaný job.
 */
const LOCK_KEY = Symbol.for('hccestice.vchlSync.lock')
type Lock = { running: boolean; since: number }
function lockState(): Lock {
  const g = globalThis as unknown as Record<symbol, Lock | undefined>
  return (g[LOCK_KEY] ??= { running: false, since: 0 })
}
const isLocked = () => {
  const l = lockState()
  return l.running && Date.now() - l.since < LOCK_STALE_MS
}

type Due = {
  due: boolean
  mode: VchlMode
  nextDueAt: Date
  lastRun: VchlSyncRun | null
}

async function checkDue(payload: Payload, settings: VchlSettings, now: Date): Promise<Due> {
  // Poslední skutečný běh: nanečisto stav nemění a přeskočené se nezapisují.
  const last = await payload.find({
    collection: 'vchl-sync-runs',
    where: { and: [{ trigger: { not_equals: 'dry' } }, { status: { not_equals: 'skipped' } }] },
    sort: '-startedAt',
    limit: 1,
    depth: 0,
  })
  const lastRun = last.docs[0] ?? null

  const windowMs = settings.matchdayWindowHours * 3_600_000
  const around = await payload.find({
    collection: 'matches',
    where: {
      and: [
        { 'team.slug': { equals: 'muzi' } },
        { date: { less_than_equal: now.toISOString() } },
        { date: { greater_than_equal: new Date(now.getTime() - windowMs).toISOString() } },
      ],
    },
    limit: 50,
    depth: 0,
  })

  const r = isDue({
    now,
    lastRunAt: lastRun?.startedAt ?? null,
    lastRunStatus: lastRun?.status ?? null,
    settings,
    ourMatches: around.docs.map((m) => ({ date: m.date, status: m.status, hasReport: m.ahl?.hasReport })),
  })
  return { ...r, lastRun }
}

function skipped(reason: 'disabled' | 'not-due' | 'locked', mode: VchlMode, t0: number): VchlRunResult {
  return {
    runId: null,
    status: 'skipped',
    skippedReason: reason,
    mode,
    changes: emptyChanges(),
    warnings: [],
    requests: 0,
    durationMs: Date.now() - t0,
  }
}

/**
 * Jeden běh synchronizace. `force` obchází `enabled` i due-check (ruční
 * spuštění z adminu), ne zámek.
 *
 * Tik, který nic nedělá (vypnuto / není na řadě / zamčeno), nezapisuje do DB
 * vůbec nic — ani záznam běhu: 288 tiků denně by zaplavilo historii.
 */
export async function runVchlSync(
  payload: Payload,
  opts: { trigger: VchlTrigger; force?: boolean },
): Promise<VchlRunResult> {
  const t0 = Date.now()
  if (isLocked()) return skipped('locked', 'idle', t0)

  const lock = lockState()
  lock.running = true
  lock.since = t0
  try {
    return await runLocked(payload, opts, t0)
  } finally {
    lock.running = false
  }
}

async function runLocked(
  payload: Payload,
  opts: { trigger: VchlTrigger; force?: boolean },
  t0: number,
): Promise<VchlRunResult> {
  const { trigger } = opts
  const now = new Date()
  const settings = await loadSettings(payload)
  const due = await checkDue(payload, settings, now)

  if (!opts.force) {
    if (!settings.enabled) return skipped('disabled', due.mode, t0)
    if (!due.due) return skipped('not-due', due.mode, t0)
  }

  const client = createAhlClient({ onRequest: breadcrumb })
  const changes = emptyChanges()
  let ctx: SyncContext | null = null
  let error: string | undefined
  const eventIds: string[] = []
  const warningsFallback: VchlRunResult['warnings'] = []

  try {
    const teamId = await resolveTeamId(payload)
    ctx = createSyncContext({ payload, client, trigger, settings, now, teamId, changes })
    await syncAll(ctx)
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    const stage = err instanceof AhlParseError ? 'parse' : err instanceof AhlFetchError ? 'fetch' : 'write'
    const id = captureFailure(err, stage, trigger, err instanceof AhlFetchError ? { url: err.url } : {})
    if (id) eventIds.push(id)
    payload.logger.error({ err }, 'vchl-sync: běh selhal')
  }

  const warnings = ctx?.warnings ?? warningsFallback
  eventIds.push(...(ctx?.sentryEventIds ?? []))
  const status: VchlRunResult['status'] = error ? 'error' : ctx && ctx.partialErrors.length > 0 ? 'partial' : 'ok'
  const dry = trigger === 'dry'

  // Do Sentry jen NOVÁ upozornění: stejné varování v řadě běhů by jinak
  // znamenalo spam (neznámý hráč se hlásí, dokud ho správce nepřiřadí).
  if (!dry) {
    const prev = new Set(
      (due.lastRun?.warnings ?? []).map((w) => `${w.type}:${w.ref ?? ''}`),
    )
    for (const w of warnings) {
      if (prev.has(`${w.type}:${w.ref ?? ''}`)) continue
      const id = captureWarning(w, trigger)
      if (id) eventIds.push(id)
    }
  }

  if (!dry && ctx && ctx.writes > 0) await revalidateAfterSync(payload, trigger)

  const finished = new Date()
  let runId: number | string | null = null
  try {
    const rec = await payload.create({
      collection: 'vchl-sync-runs',
      data: {
        trigger,
        status,
        startedAt: new Date(t0).toISOString(),
        finishedAt: finished.toISOString(),
        requests: client.requestCount,
        changes: { ...changes },
        warnings: warnings.map((w) => ({ type: w.type, message: w.message, ref: w.ref })),
        error: error ?? (ctx?.partialErrors.length ? ctx.partialErrors.join('\n') : undefined),
        sentryEventId: eventIds[0],
      },
      context: { disableRevalidate: true },
    })
    runId = rec.id
  } catch (err) {
    payload.logger.error({ err }, 'vchl-sync: záznam běhu se nepodařilo uložit')
    captureFailure(err, 'write', trigger)
  }

  if (!dry) {
    try {
      const cutoff = new Date(Date.now() - RUN_RETENTION_DAYS * 86_400_000).toISOString()
      await payload.delete({
        collection: 'vchl-sync-runs',
        where: { startedAt: { less_than: cutoff } },
        context: { disableRevalidate: true },
      })
    } catch (err) {
      payload.logger.error({ err }, 'vchl-sync: úklid starých běhů selhal')
    }
  }

  const result: VchlRunResult = {
    runId,
    status,
    mode: due.mode,
    changes,
    warnings,
    diff: dry ? ctx?.diff : undefined,
    playedNow: dry ? undefined : playedNowFromDiff(ctx?.diff),
    error,
    requests: client.requestCount,
    durationMs: Date.now() - t0,
  }

  if (!dry) {
    try {
      await notifyRun(payload, result, settings)
    } catch (err) {
      payload.logger.error({ err }, 'vchl-sync: notifikace selhala')
    }
  }
  return result
}

/**
 * Zápasy, které se v tomto běhu poprvé staly odehranými. Odvozuje se z diffu
 * (u skutečného běhu se plní stejně jako v nanečisto): jen `update` s přechodem
 * stavu na `played`. Nově založené zápasy se nepočítají — první běh nad prázdnou
 * DB by jinak „oznámil" celou historii sezóny.
 */
export function playedNowFromDiff(diff: VchlDiffEntry[] | undefined): VchlPlayedNow[] {
  const out: VchlPlayedNow[] = []
  for (const e of diff ?? []) {
    if (e.entity !== 'matches' || e.action !== 'update' || !e.fields.includes('status')) continue
    if (e.after?.status !== 'played' || e.before?.status === 'played') continue
    const matchId = Number(e.key.replace('ahl:', ''))
    if (!Number.isInteger(matchId)) continue
    const a = e.after
    const score =
      typeof a.scoreOurs === 'number' && typeof a.scoreOpp === 'number'
        ? `${a.scoreOurs}:${a.scoreOpp}${a.shootout ? ' sn' : a.overtime ? ' pp' : ''}`
        : undefined
    out.push({ matchId, label: e.label ?? `zápas ${matchId}`, score })
  }
  return out
}

type Fetched = { season: SeasonCtx; lists: SeasonLists }

/**
 * Pojistka proti změně HTML na AHL: parser, který vrátí 0 řádků tam, kde
 * je čekáme, je spíš rozbitá stránka než prázdná sezóna — a „prázdný" výpis
 * by jinak vypadal jako nic nového. Běh skončí chybou dřív, než cokoli zapíše.
 */
async function assertListsPlausible(ctx: SyncContext, season: SeasonCtx, lists: SeasonLists): Promise<void> {
  const { rozpis, vysledky } = lists
  const synced = await ctx.payload.count({
    collection: 'matches',
    where: { and: [{ season: { equals: season.id } }, { 'ahl.matchId': { exists: true } }] },
  })
  const played = await ctx.payload.count({
    collection: 'matches',
    where: {
      and: [
        { season: { equals: season.id } },
        { 'ahl.matchId': { exists: true } },
        { status: { equals: 'played' } },
      ],
    },
  })
  if (vysledky && vysledky.length === 0 && played.totalDocs > 0) {
    throw new AhlParseError('vysledky', `výpis výsledků je prázdný, ale v CMS je ${played.totalDocs} odehraných zápasů z AHL`)
  }
  if (rozpis && vysledky && rozpis.length === 0 && vysledky.length === 0 && synced.totalDocs > 0) {
    throw new AhlParseError('rozpis/vysledky', `oba výpisy jsou prázdné, ale v CMS je ${synced.totalDocs} zápasů z AHL`)
  }
}

async function syncAll(ctx: SyncContext): Promise<void> {
  const { settings } = ctx
  const p = settings.parts
  const seasons = await resolveSeasons(ctx)

  // Fáze 1: stažení a rozparsování všech seznamů. Selhání = `error` a nic
  // se nezapíše (zápisy jsou až ve fázi 2).
  const fetched: Fetched[] = []
  for (const season of seasons) {
    const list = async (name: string, url: string): Promise<AhlListMatch[]> =>
      span(`vchl.fetch.${name}`, async () =>
        parseMatchList(await ctx.client.get(url), { seasonStartYear: season.startYear }),
      )
    const lists: SeasonLists = {
      rozpis: p.schedule ? await list('rozpis', rozpisUrl(season.competitionYearId)) : null,
      vysledky: p.results ? await list('vysledky', vysledkyUrl(season.competitionYearId)) : null,
    }
    await assertListsPlausible(ctx, season, lists)
    fetched.push({ season, lists })
  }

  // Fáze 2: zápisy. Chyba jedné části nezastaví ostatní (status `partial`).
  const opponents = await createOpponentResolver(ctx)
  const players = await createPlayerResolver(ctx)
  const drafts: DraftCandidate[] = []

  for (const { season, lists } of fetched) {
    let state: SeasonMatchState | null = null
    if (lists.rozpis || lists.vysledky) {
      try {
        state = await syncSeasonMatches(ctx, season, lists, opponents, players, drafts)
      } catch (err) {
        ctx.partialFailure(err, stageOf(err), { season: season.title })
      }
    }

    if (p.standings) {
      try {
        await syncStandings(ctx, season)
      } catch (err) {
        ctx.partialFailure(err, stageOf(err), { season: season.title })
      }
    }

    if (p.matchDetail && state) {
      try {
        await checkStats(ctx, season, state.docs, state.details, players)
      } catch (err) {
        ctx.partialFailure(err, stageOf(err), { season: season.title })
      }
    }
  }

  if (p.draftPosts) await createDrafts(ctx, drafts)
}

const stageOf = (err: unknown) =>
  err instanceof AhlParseError ? 'parse' : err instanceof AhlFetchError ? 'fetch' : 'write'

async function createDrafts(ctx: SyncContext, drafts: DraftCandidate[]): Promise<void> {
  await span('vchl.draftPosts', async () => {
    for (const { doc, detail } of drafts) {
      const matchId = doc.ahl?.matchId
      if (ctx.dry || Number.isNaN(doc.id) || doc.id == null) {
        ctx.recordDiff({
          entity: 'posts',
          key: `ahl:${matchId}`,
          label: `koncept reportáže k zápasu ${matchId}`,
          action: 'create',
          fields: ['_status'],
        })
        continue
      }
      try {
        const created = await createDraftPost(ctx.payload, doc, detail, ctx)
        if (!created) continue
        await ctx.update('matches', doc.id, { ahl: { ...doc.ahl, draftPostCreated: true } })
        ctx.changes.draftPosts += 1
      } catch (err) {
        ctx.partialFailure(err, 'write', { matchId: matchId ?? undefined })
      }
    }
  })
}

/** Stav pro admin panel: zapnuto, režim, poslední běh, kdy je další, běží-li. */
export async function getVchlStatus(payload: Payload): Promise<VchlStatus> {
  const settings = await loadSettings(payload)
  const due = await checkDue(payload, settings, new Date())
  return {
    enabled: settings.enabled,
    mode: due.mode,
    lastRun: due.lastRun,
    nextDueAt: settings.enabled ? due.nextDueAt.toISOString() : null,
    running: isLocked(),
  }
}
