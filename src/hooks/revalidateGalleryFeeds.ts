import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Invaliduje tagované feedy, ve kterých fotoalba figurují —
 * `gallery-sitemap.xml` a `/llms.txt`.
 *
 * Nejde to přidat do `revalidateLanding`: ten hook visí na deseti
 * kolekcích (people, players, sponsors, matches…) a tyhle dva tagy se
 * mění jen s galeriemi.
 *
 * `unstable_cache` bez `options.revalidate` má TTL **jeden rok**, takže
 * bez tohoto hooku by se nové fotoalbum do sitemapy ani do `llms.txt`
 * nedostalo prakticky nikdy — není to optimalizace, ale podmínka
 * funkčnosti (stejný důvod jako u `revalidateNavigation`).
 *
 * Seed/importní skripty posílají `context.disableRevalidate` —
 * `revalidateTag` mimo Next runtime spadne na
 * `Invariant: static generation store missing`.
 */
const revalidate = (context: Record<string, unknown>) => {
  if (context.disableRevalidate) return

  revalidateTag('gallery-sitemap', 'max')
  revalidateTag('llms-txt', 'max')
}

export const revalidateGalleryFeeds: CollectionAfterChangeHook = ({
  doc,
  req: { context },
}) => {
  revalidate(context)
  return doc
}

export const revalidateGalleryFeedsDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  revalidate(context)
  return doc
}
