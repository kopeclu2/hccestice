import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Přesměrování čte `server/getRedirects.ts` z tagované cache. Profil `'max'`:
 * pravidlo se uplatní při dalším requestu po obnovení, nikdo na nové
 * přesměrování nečeká na vteřinu přesně.
 *
 * Seed a importní skripty (běží mimo Next runtime) posílají
 * `context.disableRevalidate`.
 */
export const revalidateRedirects = createRevalidateHooks({
  label: 'přesměrování',
  tags: [CACHE_TAGS.redirects],
  profile: 'max',
}).afterChange
