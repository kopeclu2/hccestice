import Image from 'next/image'
import React from 'react'

import type { ProductPhoto } from '@/landing/features/products/photos'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'

/** Fotky: první přes celou šířku, další jako mřížka. */
export function ProductGallery({
  photos,
  productName,
}: {
  photos: ProductPhoto[]
  productName: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.length === 0 && <div className="col-span-3 aspect-square rounded-panel bg-chip" />}
      {photos.map((photo, index) => (
        <div
          className={cn(
            'relative overflow-hidden rounded-panel bg-chip',
            index === 0 ? 'col-span-3 aspect-[4/3]' : 'aspect-square',
          )}
          key={index}
        >
          <Image
            alt={photo.alt || productName}
            className="object-contain p-6"
            fill
            priority={index === 0}
            sizes={index === 0 ? '(max-width: 64rem) 100vw, 40rem' : '13rem'}
            src={getMediaUrl(photo.url, photo.updatedAt)}
          />
        </div>
      ))}
    </div>
  )
}
