/**
 * GA se natvrdo neinjektuje do `<head>` (jak to dělal starší
 * `components/GoogleAnalytics`) — knihovna souhlasu volá `enable`/`disable`
 * ze `services.ga.onAccept`/`onReject` v `cookieConsentConfig.ts`, takže se
 * skript vůbec nestáhne, dokud návštěvník analytické cookies neodsouhlasí.
 *
 * `ga-disable-<id>` je oficiální gtag.js vypínač
 * (https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out) —
 * nastavuje se **před** načtením skriptu i po něm, takže odvolání souhlasu
 * zastaví odesílání dat, i když zůstane `<script>` tag v DOM (knihovna cookie
 * souhlasu ho neodstraňuje, jen maže `_ga*` cookies přes `autoClear`).
 */
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    [gaDisableKey: `ga-disable-${string}`]: boolean | undefined
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(args)
}

let scriptLoadPromise: Promise<void> | null = null

function loadGtagScript(measurementId: string): Promise<void> {
  scriptLoadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Nepodařilo se načíst gtag.js'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

export async function enableGoogleAnalytics(measurementId: string) {
  window[`ga-disable-${measurementId}`] = false
  await loadGtagScript(measurementId)
  gtag('js', new Date())
  gtag('config', measurementId)
}

export function disableGoogleAnalytics(measurementId: string) {
  window[`ga-disable-${measurementId}`] = true
}
