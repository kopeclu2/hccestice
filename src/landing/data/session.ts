import configPromise from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'

/**
 * Je návštěvník přihlášený do administrace?
 *
 * Používá to jen brána režimu údržby: správce musí web vidět i zavřený,
 * jinak by neměl jak zkontrolovat, co po údržbě nasazuje.
 *
 * **Nikdy nevolat bezpodmínečně v layoutu.** `headers()` je dynamické API
 * a jeho čtení na každém requestu by zrušilo prerender celého webu.
 *
 * Chybu spolkne a vrátí `false` — selhané ověření nesmí shodit stránku,
 * horší následek je jen ten, že správce uvidí údržbu jako všichni ostatní.
 */
export async function hasSession(): Promise<boolean> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await nextHeaders() })
    return Boolean(user)
  } catch {
    return false
  }
}
