import * as Sentry from '@sentry/nextjs'

import { AhlParseError } from '@/ahl'

import type { VchlTrigger, VchlWarning } from './types'

/**
 * Tenká vrstva nad Sentry. Bez DSN je všechno no-op (viz `instrumentation.ts`),
 * takže nic z toho nepotřebuje podmínky ani v dev režimu.
 */

type Where = { url?: string; matchId?: number; season?: string | number }

export type VchlStage = 'fetch' | 'parse' | 'write'

/** Vrací event id (pro `vchl-sync-runs.sentryEventId`), případně undefined. */
export function captureFailure(err: unknown, stage: VchlStage, trigger: VchlTrigger, where: Where = {}): string | undefined {
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
  return Sentry.captureException(err, {
    tags: { 'vchl.stage': stage, 'vchl.trigger': trigger },
    contexts: { vchl: { ...where } },
  })
}

export function captureWarning(w: VchlWarning, trigger: VchlTrigger): string | undefined {
  return Sentry.captureMessage(w.message, {
    // Nesedící statistiky jsou jen kontrolní součet, ne chyba dat.
    level: w.type === 'stats-mismatch' ? 'info' : 'warning',
    fingerprint: ['vchl-warning', w.type, w.ref ?? ''],
    tags: { 'vchl.warning': w.type, 'vchl.trigger': trigger },
  })
}

export function breadcrumb(info: { url: string; status: number; ms: number }): void {
  Sentry.addBreadcrumb({ category: 'vchl.http', level: info.status >= 400 || info.status === 0 ? 'warning' : 'info', data: info })
}

export function span<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name, op: 'vchl' }, fn)
}
