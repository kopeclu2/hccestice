import type { CollectionAfterChangeHook } from 'payload'

import { applyRevalidation, createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'
import { pingIndexNow } from '@/lib/indexNow'
import { routes } from '@/lib/routes'

import type { Page } from '../../../payload-types'

/** Crawlerské feedy — stale-while-revalidate stačí. */
const PAGE_REVALIDATION = {
  tags: [CACHE_TAGS.pagesSitemap, CACHE_TAGS.llmsTxt],
  profile: 'max',
} as const

/**
 * Cesty, které stránka ovlivňuje. Blok „Tréninky" na homu nese stejná data
 * jako samostatná stránka /treninky (viz `landing/features/trainings/data.ts`)
 * — bez druhé revalidace by tam změna z adminu čekala na ISR (10 min), ne na
 * uložení.
 */
const pagePaths = (slug: string | null | undefined): string[] =>
  slug === 'home' ? [routes.home, '/treninky'] : [routes.page(slug)]

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    const paths = pagePaths(doc.slug)

    applyRevalidation(payload.logger, { ...PAGE_REVALIDATION, label: 'stránku', paths })
    // Nová/upravená stránka se má dostat do Bingu a Seznamu dřív, než ji
    // znovu najde crawler — ne až při dalším průchodu `pages-sitemap.xml`.
    pingIndexNow(paths, payload.logger)
  }

  // Odpublikovaná stránka: stará cesta musí zmizet z cache
  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    applyRevalidation(payload.logger, {
      ...PAGE_REVALIDATION,
      label: 'starou stránku',
      paths: pagePaths(previousDoc.slug),
    })
  }

  return doc
}

export const revalidateDelete = createRevalidateHooks<Page>({
  ...PAGE_REVALIDATION,
  label: 'smazanou stránku',
  paths: (doc) => pagePaths(doc?.slug),
}).afterDelete
