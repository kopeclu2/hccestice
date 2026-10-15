import type { Payload } from 'payload'

import { captureFailure } from './sentry'
import type { VchlTrigger } from './types'

/**
 * Revalidace po zápisu — jednou na konci běhu, ne z hooků (zápisy jdou
 * s `disableRevalidate`).
 *
 * Ověřeno: `revalidateTag` / `revalidatePath` z cronu (mimo request) padají
 * na `Invariant: static generation store missing` (viz
 * `next/dist/server/web/spec-extension/revalidate.js` — `revalidate()` bere
 * `workAsyncStorage.getStore()`). Proto jedna cesta pro cron i ruční běh:
 * interní route handler, uvnitř kterého store existuje. Ruční běh z endpointu
 * by uměl volat přímo, ale dvě cesty by znamenaly dvě chování k ladění.
 *
 * Selhání revalidace běh neshodí: data jsou zapsaná a landing se stejně
 * obnoví po vypršení `revalidate` (600 s u ISR, tagované cache mají TTL).
 */
export async function revalidateAfterSync(
  payload: Payload,
  trigger: VchlTrigger,
): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    payload.logger.warn(
      'vchl-sync: CRON_SECRET není nastavený, revalidace přeskočena (web se obnoví po vypršení cache).',
    )
    return false
  }
  const url = `http://127.0.0.1:${process.env.PORT ?? 3000}/internal/revalidate`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (err) {
    payload.logger.error({ err }, `vchl-sync: revalidace přes ${url} selhala`)
    captureFailure(err, 'write', trigger, { url })
    return false
  }
}
