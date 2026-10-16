import { fetchMaintenance } from '@/landing/data/maintenance'
import { getPayloadClient } from '@/landing/data/query'

/**
 * Stav režimu údržby pro `src/proxy.ts`.
 *
 * Proč route handler: proxy nemá přístup k datové cache Nextu
 * (`unstable_cache`), a tak by bez něj buď chodil do databáze na každém
 * requestu, nebo by změnu přepínače nepoznal. `fetchMaintenance` je
 * tagovaná cache, kterou hook `revalidateMaintenance` expiruje okamžitě
 * (`{ expire: 0 }`), takže proxy vidí uložení v adminu do pár vteřin
 * (vlastní krátká paměť v proxy).
 *
 * `?session=1` navíc ověří přihlášení z předané cookie — jen tehdy, když
 * je režim zapnutý a request cookie Payloadu nese. Ověření jde přes
 * `payload.auth`, ne přes pouhou existenci cookie: podvržená
 * `payload-token` bránu otevřít nesmí.
 *
 * `force-dynamic` a mimo route groupy, takže nad ním není layout ani
 * `loading.tsx` (viz AGENTS.md „Cache a renderovací režimy“).
 */
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { enabled } = await fetchMaintenance()
  const wantsSession = new URL(req.url).searchParams.has('session')

  let authenticated = false
  if (enabled && wantsSession) {
    try {
      const payload = await getPayloadClient()
      const { user } = await payload.auth({ headers: req.headers })
      authenticated = Boolean(user)
    } catch {
      // Selhané ověření nesmí nic shodit; horší následek je jen, že
      // správce uvidí údržbu jako ostatní.
    }
  }

  return Response.json({ enabled, authenticated }, { headers: { 'Cache-Control': 'no-store' } })
}
