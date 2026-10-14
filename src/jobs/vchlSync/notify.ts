import * as Sentry from '@sentry/nextjs'
import type { Payload } from 'payload'

import { formattedFrom } from '@/email/config'
import {
  renderVchlSyncEmail,
  type NotificationPlan,
  type NotifyWarning,
} from '@/email/templates/vchlSync'
import { getServerSideURL } from '@/utilities/getURL'

import type { VchlRunResult, VchlSettings } from './types'

/** Minimum z uloženého běhu, které rozhodování potřebuje. */
export type PrevRun = {
  status?: string | null
  warnings?: { type?: string | null; ref?: string | null; message?: string | null }[] | null
}

const FAILING = new Set(['error', 'partial'])
const ENTITY_TYPES = new Set<string | null | undefined>(['unknown-player', 'unknown-opponent', 'ambiguous-player'])

const isFailing = (status: string | null | undefined) => FAILING.has(status ?? '')

/** Délka série selhání od začátku pole (nejnovější první). */
function streakOf(runs: PrevRun[]): number {
  let n = 0
  for (const r of runs) {
    if (!isFailing(r.status)) break
    n += 1
  }
  return n
}

/**
 * Rozhodne, co se po běhu pošle. Čistá funkce — bez DB a bez sítě, aby šla
 * otestovat na tabulce případů.
 *
 * @param prevRuns předchozí skutečné běhy (ne nanečisto, ne přeskočené),
 *   nejnovější první, BEZ právě dokončeného běhu
 *
 * Selhání se hlásí jen PŘI PŘECHODU (série dosáhne přesně `failureThreshold`):
 * v zápasovém režimu běží synchronizace každých 15 minut, takže upozornění
 * při každém dalším selhání by znamenalo 96 e-mailů denně. Návrat do normálu
 * hlásí „obnoveno", ale jen když předtím upozornění na selhání odešlo
 * (série ≥ práh). `partial` se počítá jako selhání: trvalá dílčí chyba
 * (rozbitý zápis jednoho zápasu) je přesně to, co správce chce vědět.
 *
 * Nové entity se porovnávají proti POSLEDNÍMU běhu, ne proti celé historii:
 * nejednoznačný hráč se hlásí při každém běhu znovu, ale e-mail dostane jen
 * poprvé. Přeložený zápas se rozlišuje podle textu (obsahuje staré a nové
 * datum), takže druhé přeložení téhož zápasu už se neztratí.
 */
export function decideNotifications(
  prevRuns: PrevRun[],
  current: Pick<VchlRunResult, 'status' | 'warnings' | 'error' | 'playedNow' | 'changes'>,
  settings: Pick<VchlSettings, 'notifications'>,
): NotificationPlan | null {
  if (current.status === 'skipped') return null
  const { notifyOn, failureThreshold } = settings.notifications
  const on = new Set(notifyOn)

  const plan: NotificationPlan = {
    newPlayers: [],
    ambiguousPlayers: [],
    newOpponents: [],
    rescheduled: [],
    results: [],
    draftPosts: 0,
  }

  if (on.has('failure')) {
    if (isFailing(current.status)) {
      const streak = 1 + streakOf(prevRuns)
      if (streak === failureThreshold) {
        plan.failure = {
          streak,
          status: current.status as 'error' | 'partial',
          error: current.error,
        }
      }
    } else if (current.status === 'ok') {
      const before = streakOf(prevRuns)
      if (before >= failureThreshold) plan.recovered = { after: before }
    }
  }

  const last = prevRuns[0]
  if (on.has('new-entity')) {
    const seen = new Set(
      (last?.warnings ?? []).filter((w) => ENTITY_TYPES.has(w.type)).map((w) => `${w.type}:${w.ref ?? ''}`),
    )
    for (const w of current.warnings) {
      if (!ENTITY_TYPES.has(w.type) || seen.has(`${w.type}:${w.ref ?? ''}`)) continue
      if (w.type === 'unknown-player') plan.newPlayers.push(w)
      else if (w.type === 'ambiguous-player') plan.ambiguousPlayers.push(w)
      else plan.newOpponents.push(w)
    }
  }

  if (on.has('rescheduled')) {
    const seen = new Set((last?.warnings ?? []).filter((w) => w.type === 'rescheduled').map((w) => w.message ?? ''))
    plan.rescheduled = current.warnings.filter((w) => w.type === 'rescheduled' && !seen.has(w.message))
  }

  if (on.has('result') && current.playedNow?.length) {
    plan.results = current.playedNow
    plan.draftPosts = current.changes.draftPosts
  }

  const empty =
    !plan.failure &&
    !plan.recovered &&
    plan.newPlayers.length === 0 &&
    plan.ambiguousPlayers.length === 0 &&
    plan.newOpponents.length === 0 &&
    plan.rescheduled.length === 0 &&
    plan.results.length === 0
  return empty ? null : plan
}

async function recipientsOf(payload: Payload, settings: VchlSettings): Promise<string[]> {
  const own = settings.notifications.recipients.map((r) => r.trim()).filter(Boolean)
  if (own.length > 0) return own
  const site = await payload.findGlobal({ slug: 'siteConfig', depth: 0 }).catch(() => null)
  const fallback = site?.contactEmail?.trim()
  return fallback ? [fallback] : []
}

/**
 * E-mailové upozornění po běhu (selhání v řadě, nový hráč/soupeř, přeložený
 * zápas, nový výsledek — podle `settings.notifications.notifyOn`). Volá se po
 * každém zapsaném běhu, ne po přeskočeném a ne po nanečisto.
 *
 * Chyba odeslání se zachytí tady a běh nesmí shodit.
 */
export async function notifyRun(
  payload: Payload,
  result: VchlRunResult,
  settings: VchlSettings,
): Promise<void> {
  if (result.status === 'skipped' || settings.notifications.notifyOn.length === 0) return

  try {
    const prev = await payload.find({
      collection: 'vchl-sync-runs',
      where: {
        and: [
          { trigger: { not_equals: 'dry' } },
          { status: { not_equals: 'skipped' } },
          ...(result.runId != null ? [{ id: { not_equals: result.runId } }] : []),
        ],
      },
      sort: '-startedAt',
      limit: 100,
      depth: 0,
    })

    const plan = decideNotifications(prev.docs, result, settings)
    if (!plan) return

    // Částečný běh nemá `result.error`; text chyby je jen na záznamu běhu.
    if (plan.failure && !plan.failure.error && result.runId != null) {
      const rec = await payload
        .findByID({ collection: 'vchl-sync-runs', id: result.runId, depth: 0 })
        .catch(() => null)
      plan.failure.error = rec?.error ?? undefined
    }

    const to = await recipientsOf(payload, settings)
    if (to.length === 0) {
      payload.logger.warn(
        'vchl-sync: upozornění nemá komu odeslat — vyplňte příjemce v nastavení synchronizace nebo kontaktní e-mail v Nastavení webu',
      )
      return
    }

    const base = getServerSideURL()
    const playerIds = new Map<string, number>()
    const refs = [...plan.newPlayers, ...plan.ambiguousPlayers]
      .map((w) => Number(w.ref))
      .filter((n) => Number.isInteger(n))
    if (refs.length > 0) {
      const found = await payload.find({
        collection: 'players',
        where: { ahlPlayerId: { in: refs } },
        limit: refs.length,
        depth: 0,
      })
      for (const p of found.docs) if (p.ahlPlayerId != null) playerIds.set(String(p.ahlPlayerId), p.id)
    }
    const linkFor = (w: NotifyWarning): string | undefined => {
      if (w.type === 'unknown-opponent') return `${base}/admin/collections/opponents`
      const id = w.ref ? playerIds.get(w.ref) : undefined
      return id != null ? `${base}/admin/collections/players/${id}` : undefined
    }

    const { subject, html, text } = renderVchlSyncEmail(plan, linkFor)
    await payload.sendEmail({ from: formattedFrom(), to: to.join(', '), subject, html, text })
  } catch (err) {
    payload.logger.error({ err }, 'vchl-sync: upozornění se nepodařilo odeslat')
    Sentry.captureException(err, { tags: { 'vchl.stage': 'notify' } })
  }
}
