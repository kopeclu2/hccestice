import 'server-only'

import { CLUB_NAME } from '@/lib/club'

import { cachedQuery, getPayloadClient } from './query'
import { CACHE_TAGS } from './tags'

/** Obsah údržbové stránky — `enabled` rozhoduje, jestli se vůbec zobrazí. */
export type MaintenanceState = {
  enabled: boolean
  headline: string
  perex: string
}

const DEFAULTS = {
  headline: 'Rolba právě upravuje led',
  perex: `Web ${CLUB_NAME} prochází krátkou údržbou. Za chvíli jsme zpátky — mezitím nás najdete na sociálních sítích.`,
} as const

/**
 * Stav režimu údržby z globalu `siteConfig`.
 *
 * Čte se v root layoutu, tedy na **každém** requestu veřejného webu —
 * proto tagovaná cache a ne `fetchSiteConfig()` (ta je obalená jen React
 * `cache()`, což platí v rámci jednoho renderu, ne mezi requesty).
 * Tag přepíná hook `revalidateMaintenance`.
 *
 * Chybu čtení **spolkne a vrátí `enabled: false`**. Kdyby se výjimka
 * propagovala, nedostupná databáze by shodila i stránku 500 — a ta má být
 * to poslední, co v takové situaci funguje.
 */
export const fetchMaintenance = cachedQuery(
  async (): Promise<MaintenanceState> => {
    try {
      const payload = await getPayloadClient()
      const siteConfig = await payload.findGlobal({ slug: 'siteConfig', depth: 0 })
      const maintenance = siteConfig.maintenance

      return {
        enabled: Boolean(maintenance?.enabled),
        headline: maintenance?.headline?.trim() || DEFAULTS.headline,
        perex: maintenance?.perex?.trim() || DEFAULTS.perex,
      }
    } catch {
      return { enabled: false, ...DEFAULTS }
    }
  },
  { key: 'maintenance', tags: [CACHE_TAGS.maintenance] },
)
