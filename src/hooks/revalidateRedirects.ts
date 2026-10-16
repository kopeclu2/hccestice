import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Přesměrování čte `server/getRedirects.ts` z tagované cache. Profil `'max'`:
 * pravidlo se uplatní při dalším requestu po obnovení, nikdo na nové
 * přesměrování nečeká na vteřinu přesně.
 *
 * Musí být na `afterChange` i `afterDelete`: smazané přesměrování by jinak
 * zůstalo v cache `getCachedRedirects` do vypršení TTL (3600 s) a stará
 * adresa by dál přesměrovávala.
 *
 * Seed a importní skripty (běží mimo Next runtime) posílají
 * `context.disableRevalidate`.
 */
const hooks = createRevalidateHooks({
  label: 'přesměrování',
  tags: [CACHE_TAGS.redirects],
  profile: 'max',
})

export const revalidateRedirects = hooks.afterChange
export const revalidateRedirectsDelete = hooks.afterDelete
