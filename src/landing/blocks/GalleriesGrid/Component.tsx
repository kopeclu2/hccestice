import React from 'react'

import { relId } from '@/landing/data/format'
import { fetchGalleryCards } from '@/landing/data/galleries'
import type { GalleryCard } from '@/landing/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PhotoTile, TileBadge } from '@/landing/ui/PhotoTile'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { GalleriesGridBlock } from '@/payload-types'

/** Widget galerií — načte karty galerií z kolekce dle filtrů bloku. */
export async function GalleriesGridBlockComponent({ block }: { block: GalleriesGridBlock }) {
  const galleries = await fetchGalleryCards({
    seasonId: relId(block.season),
    limit: block.limit ?? 6,
  })
  return <GalleriesGridView galleries={galleries} title={block.title ?? null} />
}

/** Galerie — mřížka fotokaret s názvem, datem a počtem fotek. */
function GalleriesGridView({
  title,
  galleries,
}: {
  title: string | null
  galleries: GalleryCard[]
}) {
  if (galleries.length === 0) return null
  return (
    <SectionShell>
      <Reveal>
        {title && (
          <CardTitle className="mb-6" size="md">
            <Highlight>{title}</Highlight>
          </CardTitle>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <PhotoTile
              className="h-55 rounded-block"
              key={gallery.id}
              photo={gallery.cover}
              sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
            >
              <TileBadge className="top-3 right-3" tone="lime">
                {gallery.photoCount} fotek
              </TileBadge>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <div className="text-sm leading-snug font-semibold md:text-base">
                  {gallery.title}
                </div>
                <div className="text-xs opacity-75">{gallery.dateLabel}</div>
              </div>
            </PhotoTile>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
