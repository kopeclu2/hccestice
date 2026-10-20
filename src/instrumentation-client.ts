import * as Sentry from '@sentry/nextjs'

import { scrubBreadcrumb, scrubEvent, scrubTransaction } from '@/lib/sentryScrub'

/**
 * Klientská inicializace. Konvence `instrumentation-client.ts` (Next 15.3+,
 * `node_modules/next/dist/docs/.../instrumentation-client.md`) nahrazuje starší
 * `sentry.client.config.ts` — soubor běží po načtení HTML, ale před hydratací.
 *
 * Bez `NEXT_PUBLIC_SENTRY_DSN` (lokální vývoj) `Sentry.init` jen zaloguje
 * varování a nic neodesílá — netřeba to podmiňovat ručně.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
  // Navigace a fetch breadcrumbs nesou celou URL — i s tokenem z odkazu pro obnovu hesla.
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubTransaction,
  beforeBreadcrumb: scrubBreadcrumb,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
