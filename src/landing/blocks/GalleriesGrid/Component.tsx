import type { GalleriesGridBlock } from '@/payload-types'

import React from 'react'

import { CardTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchGalleryCards } from '../../data/galleries'
import type { GalleryCard } from '../../types'

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {galleries.map((gallery) => (
            <PhotoTile
              className="h-55 rounded-block"
              key={gallery.id}
              photo={gallery.cover}
              sizes="(max-width: 48rem) 100vw, 33vw"
            >
              <TileBadge className="top-3 right-3" tone="lime">
                {gallery.photoCount} fotek
              </TileBadge>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <div className="text-body leading-snug font-bold">{gallery.title}</div>
                <div className="text-caption opacity-75">{gallery.dateLabel}</div>
              </div>
            </PhotoTile>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
