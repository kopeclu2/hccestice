'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PillButton } from '../components/PillButton'
import type { Photo } from '../types'

import { LightboxImage } from './LightboxImage'

/** Fotka galerie s volitelným popiskem (serializovatelné pro client boundary). */
export type GalleryPhoto = { photo: Photo; caption: string | null }

/** Kolik fotek se vykreslí na začátku a přidá každým kliknutím. */
const BATCH = 60

/**
 * Mřížka fotek detailu galerie s lightboxem (yet-another-react-lightbox —
 * virtualizuje slidy, u velkých alb renderuje jen sousední fotky).
 * Galerie mají až stovky fotek, proto se dlaždice zobrazují po dávkách.
 */
export function PhotoMasonry({ photos }: { photos: GalleryPhoto[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const [openIndex, setOpenIndex] = useState(-1)

  const slides = photos.map(({ photo, caption }) => ({
    src: getMediaUrl(photo.url),
    width: photo.width,
    height: photo.height,
    ...(caption ? { description: caption } : {}),
  }))

  return (
    <>
      {/* Dva sloupce už na mobilu: jeden sloupec fotek přes celou šířku dělal
          z 60fotkové dávky ~13 000px svislého scrollu. Užší mezera a menší
          odstup pod dlaždicí drží mozaiku na 320px pohromadě. */}
      <div className="columns-2 gap-x-2.5 md:columns-3 md:gap-x-4">
        {photos.slice(0, visibleCount).map(({ photo }, index) => (
          <button
            aria-label={`Otevřít fotku ${index + 1}`}
            className="bg-pine relative mb-2.5 block w-full cursor-zoom-in overflow-hidden rounded-badge break-inside-avoid md:mb-4"
            key={`${photo.url}-${index}`}
            onClick={() => setOpenIndex(index)}
            style={{ aspectRatio: String(photo.width / photo.height) }}
            type="button"
          >
            <Image
              alt={photo.alt}
              className="object-cover transition-transform duration-300 hover:scale-[1.03]"
              fill
              sizes="(max-width: 48rem) 50vw, 33vw"
              src={getMediaUrl(photo.url)}
            />
          </button>
        ))}
      </div>

      {visibleCount < photos.length && (
        <div className="mt-8 flex justify-center">
          <PillButton onClick={() => setVisibleCount((count) => count + BATCH)} variant="dark">
            Zobrazit další fotky ({photos.length - visibleCount})
          </PillButton>
        </div>
      )}

      <Lightbox
        close={() => setOpenIndex(-1)}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        index={openIndex}
        open={openIndex >= 0}
        plugins={[Captions, Counter, Zoom]}
        render={{ slide: LightboxImage }}
        slides={slides}
        styles={{
          container: { backgroundColor: 'color-mix(in oklab, var(--color-ink) 96%, transparent)' },
        }}
      />
    </>
  )
}
