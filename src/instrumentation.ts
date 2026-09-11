import * as Sentry from '@sentry/nextjs'

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
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
