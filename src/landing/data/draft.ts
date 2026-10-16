import 'server-only'

import { draftMode, headers } from 'next/headers'
import type { TypedUser } from 'payload'
import { cache } from 'react'

import { getPayloadClient } from '@/landing/data/query'

/**
 * Přihlášený správce, který si smí prohlížet koncepty — jinak `null`.
 *
 * Cookie draft módu je jen podepsaný příznak a po odhlášení zůstává v
 * prohlížeči, takže `draftMode().isEnabled` samo o sobě nic neříká o tom,
 * kdo se dívá. Dřív fetchery podle něj nastavovaly `overrideAccess`, a
 * zapomenutá cookie tak ukázala koncepty komukoli. Tady se při zapnutém draft
 * módu ověří skutečná session (`payload.auth`) a fetcher pak čte koncepty
 * s `overrideAccess: false` a tímto uživatelem, takže rozhodují běžná
 * přístupová pravidla kolekce.
 *
 * `headers()` se volá **jen** ve větvi draft módu. Mimo ni (běžný návštěvník,
 * prerender, ISR) by ho volání udělalo z celé stránky dynamickou — viz
 * AGENTS.md „Režim údržby → Proč ne layout". Požadavky v draft módu jsou
 * dynamické tak či tak.
 */
export const fetchDraftUser = cache(async (): Promise<TypedUser | null> => {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: await headers() })
    return user
  } catch {
    // Selhané ověření = běžný návštěvník; horší následek je jen to, že
    // správce neuvidí koncept.
    return null
  }
})
