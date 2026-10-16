import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Invaliduje tagované feedy, ve kterých fotoalba figurují —
 * `gallery-sitemap.xml` a `/llms.txt`.
 *
 * Nejde to přidat do `revalidateLanding`: ten hook visí na deseti
 * kolekcích (people, players, sponsors, matches…) a tyhle dva tagy se
 * mění jen s galeriemi. Profil `'max'` (SWR) je u crawlerských feedů
 * v pořádku — první návštěvník to nepozná.
 *
 * `unstable_cache` bez `options.revalidate` má TTL **jeden rok**, takže
 * bez tohoto hooku by se nové fotoalbum do sitemapy ani do `llms.txt`
 * nedostalo prakticky nikdy — není to optimalizace, ale podmínka
 * funkčnosti (stejný důvod jako u `revalidateNavigation`).
 */
const hooks = createRevalidateHooks({
  label: 'feedy fotoalb',
  tags: [CACHE_TAGS.gallerySitemap, CACHE_TAGS.llmsTxt],
  profile: 'max',
})

export const revalidateGalleryFeeds = hooks.afterChange
export const revalidateGalleryFeedsDelete = hooks.afterDelete
