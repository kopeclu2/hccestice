import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Invaliduje `matches-sitemap.xml`, kde figurují detaily zápasů
 * (`/zapasy/[slug]`).
 *
 * Do `revalidateLanding` to nepatří: ten visí na deseti kolekcích
 * a sitemapa se mění jen s kolekcí `matches`. Profil `'max'` (SWR) je u
 * crawlerského feedu v pořádku — první návštěvník to nepozná, crawler
 * dostane novou verzi při dalším průchodu.
 *
 * `unstable_cache` bez `options.revalidate` má TTL **jeden rok**, takže
 * bez tohoto hooku by se nový zápas do sitemapy nedostal prakticky nikdy.
 *
 * Synchronizace VČHL zapisuje s `context.disableRevalidate` a nové zápasy
 * zakládá ona, proto stejný tag invaliduje i `/internal/revalidate`.
 */
const hooks = createRevalidateHooks({
  label: 'sitemapu zápasů',
  tags: [CACHE_TAGS.matchesSitemap],
  profile: 'max',
})

export const revalidateMatchFeeds = hooks.afterChange
export const revalidateMatchFeedsDelete = hooks.afterDelete
