import type { CollectionSlug, PayloadRequest } from 'payload'

import { collectionDocPath, routes } from '@/lib/routes'

/** Query parametry `/next/preview` — sdílí generátor URL i route handler. */
export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

type Props = {
  collection: Extract<CollectionSlug, 'pages' | 'posts'>
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  // Domovská stránka žije na `/` (landing routa), ne na `/home`
  const path =
    collection === 'pages' ? routes.page(encodedSlug) : collectionDocPath(collection, encodedSlug)

  const encodedParams = new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
