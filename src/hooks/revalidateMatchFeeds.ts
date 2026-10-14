import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

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
 * Seed/importní skripty posílají `disableRevalidate` taky —
 * `revalidateTag` mimo Next runtime spadne na
 * `Invariant: static generation store missing`.
 */
const revalidate = (context: Record<string, unknown>) => {
  if (context.disableRevalidate) return

  revalidateTag('matches-sitemap', 'max')
}

export const revalidateMatchFeeds: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  revalidate(context)
  return doc
}

export const revalidateMatchFeedsDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  revalidate(context)
  return doc
}
