import type * as SentryNextjs from '@sentry/nextjs'

import { bufferEarlyErrors, loadSentry } from '@/lib/sentryClient'

/**
 * Klientská inicializace. Konvence `instrumentation-client.ts` (Next 15.3+,
 * `node_modules/next/dist/docs/.../instrumentation-client.md`) nahrazuje starší
 * `sentry.client.config.ts` — soubor běží po načtení HTML, ale před hydratací.
 *
 * Sentry SDK se tady **nesmí importovat staticky** (jen jako typ): soubor je
 * v hlavním balíčku každé stránky. Načítá ho `lib/sentryClient` líně — po
 * události `load` a v nečinnosti prohlížeče (nejpozději za 5 s); do té doby
 * se chyby jen ukládají.
 */
let sentry: typeof SentryNextjs | undefined

if (typeof window !== 'undefined') {
  bufferEarlyErrors()

  const start = () => {
    const load = () => void loadSentry().then((loaded) => (sentry = loaded))
    if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 5000 })
    else setTimeout(load, 3000)
  }

  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

/**
 * Přechod mezi stránkami: dokud SDK není načtené, se přechod nezaznamená.
 */
export const onRouterTransitionStart = (
  ...args: Parameters<typeof SentryNextjs.captureRouterTransitionStart>
) => sentry?.captureRouterTransitionStart(...args)
