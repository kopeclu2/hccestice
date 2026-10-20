import * as Sentry from '@sentry/nextjs'

import { scrubBreadcrumb, scrubEvent, scrubTransaction } from '@/lib/sentryScrub'

/**
 * `register` běží jednou při startu Next serveru — proto tu a ne v samostatných
 * `sentry.server.config.ts` / `sentry.edge.config.ts` souborech, které `@sentry/nextjs`
 * dřív vyžadoval. Runtime se musí rozlišit, protože Edge nemá Node API, na kterých
 * stojí část server SDK (`node:async_hooks` apod.).
 *
 * Bez `NEXT_PUBLIC_SENTRY_DSN` `Sentry.init` jen zaloguje varování a všechny
 * volání (`captureException` apod.) se stanou no-opem — stejný fallback princip
 * jako u e-mailového adapteru (`src/email/adapter.ts`).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
      // Bez `previewSecret`, tokenu z `/admin/reset/…`, `Authorization` a `Cookie`.
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubTransaction,
      beforeBreadcrumb: scrubBreadcrumb,
    })

    // Crony Payloadu se samy nespustí, dokud někdo neotevře admin — viz
    // `startCrons.ts`. Ne při buildu (prerender na runneru), ne při
    // `PAYLOAD_CRON=off` (lokální vývoj, CI). Bez `await`: start serveru
    // nesmí čekat na databázi.
    if (process.env.NEXT_PHASE !== 'phase-production-build' && process.env.PAYLOAD_CRON !== 'off') {
      const { startPayloadCrons } = await import('./jobs/vchlSync/startCrons')
      void startPayloadCrons()
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
      // Bez `previewSecret`, tokenu z `/admin/reset/…`, `Authorization` a `Cookie`.
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubTransaction,
      beforeBreadcrumb: scrubBreadcrumb,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
