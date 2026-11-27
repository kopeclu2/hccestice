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

import { Button } from '@/components/ui/button'
import type { Photo } from '@/landing/types'
import { getMediaUrl } from '@/lib/getMediaUrl'

import { LightboxImage } from './LightboxImage'

/** Fotka galerie s volitelným popiskem (serializovatelné pro client boundary). */
export type GalleryPhoto = { photo: Photo; caption: string | null }

/** Kolik fotek se vykreslí na začátku a přidá každým kliknutím. */
const BATCH = 60

/**
 * Řádková galerie fotek detailu galerie s lightboxem (yet-another-react-lightbox —
 * virtualizuje slidy, u velkých alb renderuje jen sousední fotky).
 * Galerie mají až stovky fotek, proto se dlaždice zobrazují po dávkách.
 */
export function PhotoMasonry({ photos }: { photos: GalleryPhoto[] }) {
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const [openIndex, setOpenIndex] = useState(-1)

  const slides = photos.map(({ photo, caption }) => ({
    src: getMediaUrl(photo.url, photo.updatedAt),
    width: photo.width,
    height: photo.height,
    ...(caption ? { description: caption } : {}),
  }))

  return (
    <>
      {/* Řádkové (justified) rozložení místo sloupcové mozaiky: každá řada má
          stejnou výšku (`--row-h`) a fotky se v ní roztáhnou na celou šířku
          podle poměru stran (`flex-grow`/`flex-basis` úměrné poměru). Vysoká
          fotka tak nevisí přes dvě řady a další řady se nerozhazují. Poslední
          řadu drží `after` s velkým `grow`, aby se jedna fotka nenatáhla přes
          celou šířku. Řazení jde zleva doprava po řádcích. */}
      <div className="flex flex-wrap gap-2.5 [--row-h:7.5rem] after:grow-1000 after:content-[''] md:gap-4 md:[--row-h:13rem]">
        {photos.slice(0, visibleCount).map(({ photo }, index) => {
          const ratio = photo.width / photo.height
          return (
            <button
              aria-label={`Otevřít fotku ${index + 1}`}
              className="relative block cursor-zoom-in overflow-hidden rounded-thumb bg-pine"
              key={`${photo.url}-${index}`}
              onClick={() => setOpenIndex(index)}
              style={{
                aspectRatio: String(ratio),
                flexBasis: `calc(var(--row-h) * ${ratio})`,
                flexGrow: Math.round(ratio * 100),
              }}
              type="button"
            >
              {/* Jen první dlaždice je `eager` + `fetchPriority="high"` (LCP kandidát):
                  Next u každého eager obrázku přidá `<link rel="preload">`, další
                  by se s ní přetahovaly o šířku pásma. Zbytek je lazy. Šířka
                  dlaždice se řídí poměrem stran, `sizes` je proto hrubý odhad. */}
              <Image
                alt={photo.alt}
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                fetchPriority={index === 0 ? 'high' : undefined}
                fill
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(min-width: 48rem) 40vw, 60vw"
                src={getMediaUrl(photo.url, photo.updatedAt)}
              />
            </button>
          )
        })}
      </div>

      {visibleCount < photos.length && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => setVisibleCount((count) => count + BATCH)} variant="dark">
            Zobrazit další fotky ({photos.length - visibleCount})
          </Button>
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
