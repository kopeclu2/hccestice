import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      // Blok „Tréninky" na homu nese stejná data jako samostatná stránka
      // /treninky (viz `landing/data/trainings.ts`) — bez druhé revalidace
      // by tam změna z adminu čekala na ISR (10 min), ne na uložení.
      if (doc.slug === 'home') revalidatePath('/treninky')
      revalidateTag('pages-sitemap', 'max')
      revalidateTag('llms-txt', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      if (previousDoc.slug === 'home') revalidatePath('/treninky')
      revalidateTag('pages-sitemap', 'max')
      revalidateTag('llms-txt', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
    revalidatePath(path)
    if (doc?.slug === 'home') revalidatePath('/treninky')
    revalidateTag('pages-sitemap', 'max')
    revalidateTag('llms-txt', 'max')
  }

  return doc
}
