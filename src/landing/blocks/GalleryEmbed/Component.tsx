import type { GalleryEmbedBlock } from '@/payload-types'

import React from 'react'

import type { Photo } from '../../types'

import { CardTitle } from '../../components/Heading'
import { PhotoTile } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId, toPhoto } from '../../data/format'
import { fetchGallery } from '../../data/galleries'

/** Vložená galerie — nadpis + mřížka prvních N fotek. */
export async function GalleryEmbedBlockComponent({ block }: { block: GalleryEmbedBlock }) {
  const galleryId = relId(block.gallery)
  if (!galleryId) return null
  const gallery = await fetchGallery(galleryId)
  if (!gallery) return null
  const photos = (gallery.photos ?? [])
    .map((row) => (typeof row.image === 'object' && row.image ? toPhoto(row.image) : null))
    .filter((photo): photo is NonNullable<typeof photo> => photo !== null)
    .slice(0, block.limit ?? 8)
  return <GalleryEmbedView photos={photos} title={block.title ?? gallery.title} />
}

function GalleryEmbedView({ title, photos }: { title: string | null; photos: Photo[] }) {
  if (photos.length === 0) return null
  return (
    <SectionShell>
      <Reveal>
        {title && (
          <CardTitle className="mb-6" size="md">
            {title}
          </CardTitle>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <PhotoTile
              className="aspect-[4/3] rounded-thumb"
              gradient="none"
              key={`${photo.url}-${index}`}
              photo={photo}
              sizes="(max-width: 48rem) 50vw, 25vw"
            />
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
