import { TURNSTILE_SITEVERIFY_URL } from './config'

/**
 * Odpověď Cloudflare siteverify API.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
type SiteVerifyResponse = {
  success: boolean
  hostname?: string
  'error-codes'?: string[]
}

export type TurnstileVerifyResult = { ok: true } | { ok: false; reason: string }

const TIMEOUT_MS = 5_000

/**
 * Serverové ověření Turnstile tokenu.
 *
 * ⚠️ Čte `TURNSTILE_SECRET_KEY`, takže nikdy neimportovat z klientské
 * komponenty. `server-only` tu přesto **není**: modul importuje Payload hook
 * (`hooks/verifyTurnstile`), a ten je dosažitelný z `payload.config.ts`, takže
 * by mimo Next runtime shodil `payload migrate` a seed skripty.
 *
 * Používají ho oba kanály odeslání formuláře: server action landing kontaktu
 * (local API) a hook na `form-submissions` (REST, blok Formulář).
 *
 * Bez nastaveného secretu se mimo produkci ověření přeskakuje (dev a CI běží
 * bez účtu u Cloudflaru), v produkci se odeslání odmítne. Token je
 * jednorázový: druhé ověření téhož tokenu Cloudflare odmítne.
 */
export async function verifyTurnstileToken({
  token,
  remoteIp,
  secret = process.env.TURNSTILE_SECRET_KEY,
  isProd = process.env.NODE_ENV === 'production',
  fetchImpl = fetch,
}: {
  token: string | null
  remoteIp?: string | null
  secret?: string
  isProd?: boolean
  fetchImpl?: typeof fetch
}): Promise<TurnstileVerifyResult> {
  if (!secret) {
    if (isProd) return { ok: false, reason: 'TURNSTILE_SECRET_KEY není nastavený' }
    console.warn('TURNSTILE_SECRET_KEY není nastavený — ověření proti spamu se přeskakuje (dev).')
    return { ok: true }
  }

  if (!token) return { ok: false, reason: 'chybí token' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let result: SiteVerifyResponse
  try {
    const response = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) return { ok: false, reason: `siteverify vrátilo ${response.status}` }
    result = (await response.json()) as SiteVerifyResponse
  } catch (error) {
    console.error('Ověření Turnstile tokenu selhalo', error)
    return { ok: false, reason: 'siteverify nedostupné' }
  }

  if (!result.success) {
    return {
      ok: false,
      reason: `odmítnuto: ${result['error-codes']?.join(', ') ?? 'neznámý důvod'}`,
    }
  }

  return { ok: true }
}
