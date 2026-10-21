import type * as SentryNextjs from '@sentry/nextjs'

import { scrubBreadcrumb, scrubEvent, scrubTransaction } from '@/lib/sentryScrub'

/**
 * Sentry v prohlížeči se načítá **líně**, až po načtení stránky a v době, kdy
 * je prohlížeč nečinný. Statický import (`instrumentation-client.ts`) dával
 * SDK (~42 kB gzip) do hlavního balíčku každé stránky a jeho inicializace
 * běžela na hlavním vlákně těsně před hydratací — na mobilním Lighthouse
 * (4× pomalejší CPU) to je znát na TBT i na vykreslení LCP.
 *
 * Cena: chyby, které nastanou dřív, než se SDK načte, zachytí jen záchytné
 * posluchače níž (`bufferEarlyErrors`) a po načtení je odešlou; měření
 * výkonu (`tracesSampleRate`) pro načtení stránky nezachytí její začátek.
 *
 * Bez `NEXT_PUBLIC_SENTRY_DSN` (lokální vývoj) `Sentry.init` jen zaloguje
 * varování a nic neodesílá.
 */

let loading: Promise<typeof SentryNextjs> | undefined

/** Chyby zachycené, než se SDK načetlo (viz `bufferEarlyErrors`). */
const early: unknown[] = []
const collect = (event: ErrorEvent | PromiseRejectionEvent) => {
  if (early.length < 10)
    early.push('reason' in event ? event.reason : (event.error ?? event.message))
}

/** Načte SDK a inicializuje ho. Opakované volání vrací tentýž příslib. */
export function loadSentry(): Promise<typeof SentryNextjs> {
  loading ??= import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
      // Navigace a fetch breadcrumbs nesou celou URL — i s tokenem z odkazu pro obnovu hesla.
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubTransaction,
      beforeBreadcrumb: scrubBreadcrumb,
    })
    // Od teď chytá chyby SDK samo; uložené z doby před načtením se odešlou.
    window.removeEventListener('error', collect)
    window.removeEventListener('unhandledrejection', collect)
    for (const error of early.splice(0)) Sentry.captureException(error)
    return Sentry
  })
  return loading
}

/** Chyba z error boundary (`error.tsx`, `global-error.tsx`): SDK se načte, až když je potřeba. */
export function captureClientError(error: unknown): void {
  void loadSentry().then((Sentry) => Sentry.captureException(error))
}

/**
 * Do načtení SDK ukládá `error` a `unhandledrejection` (max. 10), aby se
 * neztratily. Samo nic nenačítá.
 */
export function bufferEarlyErrors(): void {
  window.addEventListener('error', collect)
  window.addEventListener('unhandledrejection', collect)
}
