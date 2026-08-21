'use client'

import { useCallback, useEffect } from 'react'

import { RECAPTCHA_SITE_KEY, type RecaptchaAction } from './config'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const SCRIPT_ID = 'recaptcha-v3'

/**
 * Nahraje reCAPTCHA v3 skript a vrátí `execute()` pro získání tokenu.
 *
 * Skript se vkládá **líně z komponenty formuláře**, ne globálně z layoutu —
 * na stránkách bez formuláře se tak nestahuje vůbec. Vložení je idempotentní,
 * takže dva formuláře na jedné stránce si skript nepřidají dvakrát.
 *
 * `execute()` vrací `null`, když site key chybí (lokální dev bez klíčů) nebo
 * když Google selže. Volající pak požadavek pošle bez hlavičky/tokenu
 * a rozhodnutí nechá na serveru — ten v produkci odmítne, v devu pustí.
 */
export function useRecaptcha() {
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || document.getElementById(SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    document.head.appendChild(script)
    // Skript se úmyslně neuklízí — je sdílený mezi formuláři a jeho opětovné
    // nahrávání při navigaci by jen zdržovalo.
  }, [])

  const execute = useCallback(async (action: RecaptchaAction): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) return null

    const grecaptcha = window.grecaptcha
    if (!grecaptcha) return null

    try {
      await new Promise<void>((resolve) => grecaptcha.ready(resolve))
      return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
    } catch (error) {
      console.warn('reCAPTCHA se nepodařilo vyhodnotit', error)
      return null
    }
  }, [])

  return { execute }
}
