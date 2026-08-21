import { RECAPTCHA_SCORE_THRESHOLD, type RecaptchaAction } from './config'

/**
 * Odpověď Google siteverify API.
 * https://developers.google.com/recaptcha/docs/verify
 */
type SiteVerifyResponse = {
  success: boolean
  score?: number
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

export type RecaptchaVerifyResult = { ok: true } | { ok: false; reason: string }

/**
 * Serverové ověření reCAPTCHA tokenu.
 *
 * ⚠️ Server-only — čte `RECAPTCHA_SECRET`. Nikdy neimportovat z klientské
 * komponenty.
 *
 * Existuje proto, že plugin `payload-recaptcha-v3` ověřuje **jen operace přes
 * REST** (`payloadAPI === 'REST'`, viz `dist/hookBuilder.js`). Landing kontakt
 * jde přes server action a local API, takže by ho plugin minul. Logika i
 * threshold jsou schválně shodné s pluginem, aby se oba kanály chovaly stejně.
 *
 * Bez nastaveného secretu se mimo produkci ověření přeskakuje (dev a CI běží
 * bez účtu u Googlu), v produkci se odesílání odmítne.
 */
export async function verifyRecaptchaToken({
  token,
  action,
  remoteIp,
}: {
  token: string | null
  action: RecaptchaAction
  remoteIp?: string | null
}): Promise<RecaptchaVerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'RECAPTCHA_SECRET není nastavený' }
    }
    console.warn('RECAPTCHA_SECRET není nastavený — ověření proti spamu se přeskakuje (dev).')
    return { ok: true }
  }

  if (!token) return { ok: false, reason: 'chybí token' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let result: SiteVerifyResponse
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      // reCAPTCHA přijímá výhradně x-www-form-urlencoded
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    result = (await response.json()) as SiteVerifyResponse
  } catch (error) {
    console.error('Ověření reCAPTCHA tokenu selhalo', error)
    return { ok: false, reason: 'siteverify nedostupné' }
  }

  if (!result.success) {
    return { ok: false, reason: `odmítnuto: ${result['error-codes']?.join(', ') ?? 'neznámý důvod'}` }
  }
  if (result.action !== action) {
    return { ok: false, reason: `nesouhlasí akce (${result.action} ≠ ${action})` }
  }
  if ((result.score ?? 0) < RECAPTCHA_SCORE_THRESHOLD) {
    return { ok: false, reason: `nízké skóre ${result.score}` }
  }

  return { ok: true }
}
