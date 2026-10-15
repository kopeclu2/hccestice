import { PayloadRequest, CollectionSlug } from 'payload'

import { PreviewSearchParams } from '@/app/(landing)/next/preview/route'
import { collectionDocPath, routes } from '@/lib/routes'

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
