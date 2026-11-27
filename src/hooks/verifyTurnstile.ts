import { APIError, type CollectionBeforeOperationHook } from 'payload'

import { getClientIp } from '@/lib/rateLimit'
import { TURNSTILE_HEADER } from '@/lib/turnstile/config'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'

/**
 * Ověří Turnstile token při `create` na `form-submissions`.
 *
 * Kolekce je veřejně zapisovatelná (`access.create` z form-builderu), takže
 * ochranu musíme dodat sami. Hlídá se **jen REST** (`payloadAPI === 'REST'`):
 * server action landing kontaktu jde přes local API a ověřuje si token sama
 * (`landing/features/contact/action.ts`), jinak by se ověřil dvakrát a druhé
 * ověření téhož (jednorázového) tokenu by Cloudflare odmítl.
 *
 * Přihlášený správce projde — admin panel jde taky přes REST, takže bez toho
 * by nemohl s odeslanými formuláři pracovat.
 */
export const verifyTurnstile: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation !== 'create' || req.payloadAPI !== 'REST' || req.user) return args

  const clientIp = getClientIp(req.headers)
  const verified = await verifyTurnstileToken({
    token: req.headers.get(TURNSTILE_HEADER),
    remoteIp: clientIp === 'unknown' ? null : clientIp,
  })

  if (!verified.ok) {
    req.payload.logger.warn({ reason: verified.reason }, 'Turnstile odmítl odeslání formuláře')
    // Blok Formulář zobrazuje `res.errors[0].message`, proto česky.
    throw new APIError('Nepodařilo se ověřit, že nejste robot. Zkuste to prosím znovu.', 403)
  }

  return args
}
