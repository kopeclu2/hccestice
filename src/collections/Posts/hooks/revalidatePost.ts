import type { CollectionAfterChangeHook } from 'payload'

import { applyRevalidation, createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'
import { pingIndexNow } from '@/lib/indexNow'
import { routes } from '@/lib/routes'

import type { Post } from '../../../payload-types'

/**
 * Změna článku zasahuje výpis (`posts-list`, redakční obsah → okamžitě)
 * a crawlerské feedy (sitemapa, `llms.txt` → stale-while-revalidate stačí).
 */
const POST_REVALIDATION = {
  tags: [CACHE_TAGS.posts],
  profile: { expire: 0 },
  feeds: [CACHE_TAGS.postsSitemap, CACHE_TAGS.llmsTxt],
} as const

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    const path = routes.post(doc.slug)

    applyRevalidation(payload.logger, {
      ...POST_REVALIDATION,
      label: `článek ${path}`,
      paths: [path],
    })
    // Nový/upravený článek se má dostat do Bingu a Seznamu dřív, než ho
    // znovu najde crawler — ne až při dalším průchodu `posts-sitemap.xml`.
    pingIndexNow([path], payload.logger)
  }

  // Odpublikovaný článek: stará cesta musí zmizet z cache
  if (previousDoc._status === 'published' && doc._status !== 'published') {
    const oldPath = routes.post(previousDoc.slug)

    applyRevalidation(payload.logger, {
      ...POST_REVALIDATION,
      label: `starý článek ${oldPath}`,
      paths: [oldPath],
    })
  }

  // Změna slugu publikovaného článku — stará cesta by jinak zůstala v cache
  if (
    doc._status === 'published' &&
    previousDoc._status === 'published' &&
    previousDoc.slug &&
    previousDoc.slug !== doc.slug
  ) {
    const oldPath = routes.post(previousDoc.slug)

    applyRevalidation(payload.logger, {
      label: `přejmenovaný článek ${oldPath}`,
      tags: [],
      profile: POST_REVALIDATION.profile,
      paths: [oldPath],
    })
  }

  return doc
}

export const revalidateDelete = createRevalidateHooks<Post>({
  ...POST_REVALIDATION,
  label: 'smazaný článek',
  paths: (doc) => (doc.slug ? [routes.post(doc.slug)] : []),
}).afterDelete
