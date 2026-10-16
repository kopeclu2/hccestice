import * as Sentry from '@sentry/nextjs'

import { AhlFetchError, AhlParseError } from '@/ahl'

import type { VchlTrigger, VchlWarning } from './types'

/**
 * Tenká vrstva nad Sentry. Bez DSN je všechno no-op (viz `instrumentation.ts`),
 * takže nic z toho nepotřebuje podmínky ani v dev režimu.
 */

type Where = { url?: string; matchId?: number; season?: string | number }

export type VchlStage = 'fetch' | 'parse' | 'write'

/** Vrací event id (pro `vchl-sync-runs.sentryEventId`), případně undefined. */
export function captureFailure(
  err: unknown,
  stage: VchlStage,
  trigger: VchlTrigger,
  where: Where = {},
): string | undefined {
  // Nanečisto je ruční kontrola z adminu: chyba je vidět ve výsledku a v logu,
  // do Sentry nepatří (nezakládalo by issue ani neznečišťovalo statistiky).
  if (trigger === 'dry') return undefined
  if (err instanceof AhlParseError) {
    // Změna HTML na ahl.cz rozbije parser při každém tiku. Fingerprint podle
    // stránky je seskupí do jednoho issue místo stovek denně.
    return Sentry.captureMessage(err.message, {
      level: 'error',
      fingerprint: ['vchl-parse', err.page],
      tags: { 'vchl.stage': 'parse', 'vchl.trigger': trigger },
      contexts: { vchl: { ...where, page: err.page, reason: err.reason } },
    })
  }
  if (err instanceof AhlFetchError) {
    // Fingerprint podle typu stránky (`zapas`, `vysledky`…), ne podle celé URL:
    // `?zapasid=…` by jinak z jedné výpadku AHL udělalo issue na každý zápas.
    return Sentry.captureException(err, {
      fingerprint: ['vchl-fetch', ahlPageOf(err.url)],
      tags: { 'vchl.stage': stage, 'vchl.trigger': trigger },
      contexts: { vchl: { ...where } },
    })
  }
  return Sentry.captureException(err, {
    tags: { 'vchl.stage': stage, 'vchl.trigger': trigger },
    contexts: { vchl: { ...where } },
  })
}

/** Typ stránky z URL bez query a hostitele: `…/zapas/?zapasid=1` → `zapas`. */
export function ahlPageOf(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    return parts.at(-1) ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

export function captureWarning(w: VchlWarning, trigger: VchlTrigger): string | undefined {
  if (trigger === 'dry') return undefined
  return Sentry.captureMessage(w.message, {
    // Nesedící statistiky jsou jen kontrolní součet, ne chyba dat.
    level: w.type === 'stats-mismatch' ? 'info' : 'warning',
    fingerprint: ['vchl-warning', w.type, w.ref ?? ''],
    tags: { 'vchl.warning': w.type, 'vchl.trigger': trigger },
  })
}

export function breadcrumb(info: { url: string; status: number; ms: number }): void {
  Sentry.addBreadcrumb({
    category: 'vchl.http',
    level: info.status >= 400 || info.status === 0 ? 'warning' : 'info',
    data: info,
  })
}

export function span<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name, op: 'vchl' }, fn)
}

/** Kořen jednoho běhu synchronizace; `span()` uvnitř se k němu připojí jako potomci. */
export function rootSpan<T>(fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name: 'vchl.run', op: 'job' }, fn)
}
