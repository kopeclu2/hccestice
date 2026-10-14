import type { Endpoint, PayloadHandler, PayloadRequest } from 'payload'

import { AhlFetchError, AhlParseError, createAhlClient } from '@/ahl'
import { detectSeasonIds } from '@/jobs/vchlSync/context'
import { getVchlStatus, runVchlSync } from '@/jobs/vchlSync/run'
import type { VchlWarning } from '@/jobs/vchlSync/types'

/**
 * Endpointy ovládací stránky `/admin/vchl-sync`. Všechny jen pro přihlášeného
 * uživatele (stejně jako global `vchl-sync`, viz `access/authenticated`).
 */

const json = (body: unknown, status = 200) => Response.json(body, { status })

const unauthorized = () => json({ message: 'Pro tuto akci se musíte přihlásit.' }, 401)

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    const body = await req.json?.()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/** Obalí handler kontrolou přihlášení a převodem výjimky na JSON. */
const authed =
  (fn: (req: PayloadRequest) => Promise<Response>): PayloadHandler =>
  async (req) => {
    if (!req.user) return unauthorized()
    try {
      return await fn(req)
    } catch (err) {
      req.payload.logger.error({ err }, 'vchl-sync endpoint selhal')
      const message =
        err instanceof AhlFetchError || err instanceof AhlParseError
          ? err.message
          : 'Operace selhala, podrobnosti jsou v logu serveru.'
      return json({ message }, 500)
    }
  }

export type VchlWarningLink = { label: string; href: string }
export type VchlLinkedWarning = VchlWarning & { link?: VchlWarningLink }

/**
 * K varování doplní odkaz do administrace. Co job ukládá do `ref`:
 * - unknown-player / ambiguous-player: `ahlPlayerId` (číslo) nebo jméno hráče
 * - unknown-opponent: název soupeře z AHL (hledá se v názvu i aliasech)
 * - rescheduled / missing-on-ahl / other / stats-mismatch: `ahl.matchId`,
 *   resp. `ahlPlayerId` u neshody statistik hráče
 */
async function linkWarnings(req: PayloadRequest, warnings: VchlWarning[]): Promise<VchlLinkedWarning[]> {
  const { payload } = req
  const out: VchlLinkedWarning[] = []
  for (const w of warnings) {
    const ref = w.ref?.trim()
    let link: VchlWarningLink | undefined
    if (ref) {
      try {
        const numeric = /^\d+$/.test(ref) ? Number(ref) : null
        if (w.type === 'unknown-player' || w.type === 'ambiguous-player' || w.type === 'stats-mismatch') {
          const res = await payload.find({
            collection: 'players',
            where: numeric != null ? { ahlPlayerId: { equals: numeric } } : { name: { equals: ref } },
            limit: 1,
            depth: 0,
            req,
          })
          const doc = res.docs[0]
          if (doc) link = { label: `Hráč ${doc.name}`, href: `/admin/collections/players/${doc.id}` }
        } else if (w.type === 'unknown-opponent') {
          const res = await payload.find({
            collection: 'opponents',
            where: { or: [{ name: { equals: ref } }, { 'aliases.name': { equals: ref } }] },
            limit: 1,
            depth: 0,
            req,
          })
          const doc = res.docs[0]
          if (doc) link = { label: `Soupeř ${doc.name}`, href: `/admin/collections/opponents/${doc.id}` }
        } else if (numeric != null) {
          const res = await payload.find({
            collection: 'matches',
            where: { 'ahl.matchId': { equals: numeric } },
            limit: 1,
            depth: 0,
            req,
          })
          const doc = res.docs[0]
          if (doc) link = { label: `Zápas ${ref}`, href: `/admin/collections/matches/${doc.id}` }
        }
      } catch {
        // odkaz je jen doplněk, varování se zobrazí i bez něj
      }
    }
    out.push({ ...w, link })
  }
  return out
}

const status: Endpoint = {
  path: '/vchl-sync/status',
  method: 'get',
  handler: authed(async (req) => {
    const { payload } = req
    const [st, runs] = await Promise.all([
      getVchlStatus(payload),
      payload.find({
        collection: 'vchl-sync-runs',
        sort: '-startedAt',
        limit: 20,
        depth: 0,
        select: {
          trigger: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          requests: true,
          changes: true,
          warnings: true,
          error: true,
          sentryEventId: true,
        },
        req,
      }),
    ])

    // Varování z posledního ne-dry běhu (stejný zdroj jako deduplikace v jobu).
    const lastReal = await payload.find({
      collection: 'vchl-sync-runs',
      where: { and: [{ trigger: { not_equals: 'dry' } }, { status: { not_equals: 'skipped' } }] },
      sort: '-startedAt',
      limit: 1,
      depth: 0,
      select: { warnings: true },
      req,
    })
    const warnings = (lastReal.docs[0]?.warnings ?? []).map((w) => ({
      type: w.type,
      message: w.message,
      ref: w.ref ?? undefined,
    })) as VchlWarning[]

    return json({
      status: {
        enabled: st.enabled,
        mode: st.mode,
        nextDueAt: st.nextDueAt,
        running: st.running,
        lastRun: st.lastRun
          ? {
              id: st.lastRun.id,
              trigger: st.lastRun.trigger,
              status: st.lastRun.status,
              startedAt: st.lastRun.startedAt,
              finishedAt: st.lastRun.finishedAt,
              changes: st.lastRun.changes,
              error: st.lastRun.error ?? null,
            }
          : null,
      },
      runs: runs.docs,
      warnings: await linkWarnings(req, warnings),
    })
  }),
}

const run: Endpoint = {
  path: '/vchl-sync/run',
  method: 'post',
  handler: authed(async (req) => {
    const body = await readBody(req)
    const dryRun = body.dryRun === true
    const result = await runVchlSync(req.payload, { trigger: dryRun ? 'dry' : 'manual', force: true })
    if (result.status === 'skipped' && result.skippedReason === 'locked') {
      return json({ message: 'Synchronizace právě běží, zkuste to za chvíli.', result }, 409)
    }
    return json({ ...result, warnings: await linkWarnings(req, result.warnings) })
  }),
}

const toggle: Endpoint = {
  path: '/vchl-sync/toggle',
  method: 'post',
  handler: authed(async (req) => {
    const body = await readBody(req)
    if (typeof body.enabled !== 'boolean') {
      return json({ message: 'Chybí hodnota „enabled" (true/false).' }, 400)
    }
    // `req` kvůli auditu: auditor z něj bere přihlášeného uživatele.
    await req.payload.updateGlobal({
      slug: 'vchl-sync',
      data: { enabled: body.enabled },
      depth: 0,
      req,
    })
    return json({ enabled: body.enabled })
  }),
}

const detect: Endpoint = {
  path: '/vchl-sync/detect',
  method: 'post',
  handler: authed(async (req) => {
    const { payload } = req
    const body = await readBody(req)
    const seasons = await payload.find({
      collection: 'seasons',
      where: { isCurrent: { equals: true } },
      sort: '-startYear',
      limit: 0,
      depth: 0,
      req,
    })
    const season = seasons.docs[0]
    if (!season) return json({ message: 'V CMS není žádná sezóna označená jako aktuální.' }, 404)

    // Bez předvyplněných hodnot: ukáže, co AHL hlásí teď. Ostatní aktuální
    // sezóny slouží jen k obraně proti ročníku, který patří jiné z nich.
    const detected = await detectSeasonIds(createAhlClient(), null, null, seasons.docs.slice(1))
    const current = {
      competitionYearId: season.ahl?.competitionYearId ?? null,
      participantId: season.ahl?.participantId ?? null,
    }
    const saved = body.save === true
    if (saved) {
      await payload.update({
        collection: 'seasons',
        id: season.id,
        data: { ahl: { competitionYearId: detected.year, participantId: detected.participant } },
        depth: 0,
        req,
      })
    }
    return json({
      season: { id: season.id, title: season.title },
      current,
      detected: { competitionYearId: detected.year, participantId: detected.participant },
      changed:
        current.competitionYearId !== detected.year || current.participantId !== detected.participant,
      saved,
    })
  }),
}

export const vchlSyncEndpoints: Endpoint[] = [status, run, toggle, detect]
