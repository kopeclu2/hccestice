'use client'

import { useCallback, useEffect, useRef } from 'react'

import { TURNSTILE_SCRIPT_URL, TURNSTILE_SITE_KEY } from './config'

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      appearance: 'interaction-only'
      language: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_ID = 'cf-turnstile'

/** Jak dlouho `getToken()` čeká na vyřešenou výzvu, než vzdá. */
const TOKEN_WAIT_MS = 10_000

let scriptPromise: Promise<TurnstileApi | null> | null = null

/**
 * Vloží skript Turnstile jednou za stránku. Sdílená promise zajistí, že dva
 * formuláře na jedné stránce si skript nepřidají dvakrát.
 */
function loadTurnstile(): Promise<TurnstileApi | null> {
  scriptPromise ??= new Promise((resolve) => {
    if (window.turnstile) return resolve(window.turnstile)

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(window.turnstile ?? null)
    script.onerror = () => {
      scriptPromise = null
      resolve(null)
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Cloudflare Turnstile v režimu „interaction-only“: widget je neviditelný
 * a ukáže se jen tehdy, když návštěvníka potřebuje vyzvat. Stránka tedy při
 * běžném odeslání nic navíc nekreslí.
 *
 * Skript se vkládá **líně z komponenty formuláře**, ne globálně z layoutu —
 * na stránkách bez formuláře se nestahuje. Turnstile nepoužívá cookies, takže
 * nepotřebuje souhlas.
 *
 * `ref` patří na prázdný `<div>` uvnitř formuláře. `getToken()` vrací `null`,
 * když site key chybí (lokální dev) nebo výzva selže; volající pak odešle
 * formulář bez tokenu a rozhodnutí nechá na serveru — ten v produkci odmítne,
 * v devu pustí. Token je jednorázový, proto po odeslání volejte `reset()`.
 */
export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const waitersRef = useRef<Array<(token: string | null) => void>>([])

  useEffect(() => {
    const container = containerRef.current
    if (!TURNSTILE_SITE_KEY || !container) return

    let cancelled = false

    const settle = (token: string | null) => {
      tokenRef.current = token
      if (!token) return
      for (const resolve of waitersRef.current.splice(0)) resolve(token)
    }

    void loadTurnstile().then((turnstile) => {
      if (cancelled || !turnstile) return
      widgetIdRef.current = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        language: 'cs',
        callback: (token) => settle(token),
        'expired-callback': () => settle(null),
        'error-callback': () => settle(null),
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = null
      tokenRef.current = null
    }
  }, [])

  const getToken = useCallback((): Promise<string | null> => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve(null)
    if (tokenRef.current) return Promise.resolve(tokenRef.current)

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), TOKEN_WAIT_MS)
      waitersRef.current.push((token) => {
        clearTimeout(timer)
        resolve(token)
      })
    })
  }, [])

  const reset = useCallback(() => {
    tokenRef.current = null
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current)
  }, [])

  return { containerRef, getToken, reset }
}
