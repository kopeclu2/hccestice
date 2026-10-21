import React from 'react'

import type { Photo } from '@/landing/types'
import { toDate, utcToPragueLocal } from '@/lib/datetime'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { routes } from '@/lib/routes'
import { toImageGallery } from '@/lib/schemaOrg'

/**
 * JSON-LD `ImageGallery` detailu fotogalerie. `date` je den akce z CMS
 * (UTC ISO), do dat jde jako den v Europe/Prague.
 */
export function GalleryJsonLd({
  date,
  photos,
  slug,
  title,
}: {
  date: string | null
  photos: Array<{ photo: Photo; caption: string | null }>
  slug: string
  title: string
}) {
  const baseUrl = getServerSideURL()
  const jsonLd = toImageGallery({
    baseUrl,
    path: routes.gallery(slug),
    name: title,
    dateCreated: date && toDate(date) ? utcToPragueLocal(date).day : null,
    photos: photos.map(({ caption, photo }) => ({
      url: `${baseUrl}${getMediaUrl(photo.url, photo.updatedAt)}`,
      caption,
    })),
  })

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
