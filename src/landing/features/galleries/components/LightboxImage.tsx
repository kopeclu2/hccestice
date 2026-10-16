'use client'

import Image from 'next/image'
import React from 'react'
import {
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  useLightboxState,
  type RenderSlideProps,
  type Slide,
} from 'yet-another-react-lightbox'

const isNextJsImage = (
  slide: Slide,
): slide is Slide & { src: string; width: number; height: number } =>
  isImageSlide(slide) && typeof slide.width === 'number' && typeof slide.height === 'number'

/**
 * Slide lightboxu přes `next/image` — oficiální recept YARL pro Next.js
 * (docs/examples/nextjs.md): spočítá rozměry podle viewportu a nechá
 * Next servírovat optimalizovanou variantu.
 */
export function LightboxImage({ slide, offset, rect }: RenderSlideProps) {
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps()
  const { currentIndex } = useLightboxState()

  if (!isNextJsImage(slide)) return undefined

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)
  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width
  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        alt=""
        draggable={false}
        fill
        loading="eager"
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        src={slide.src}
        style={{
          objectFit: cover ? 'cover' : 'contain',
          cursor: click ? 'pointer' : undefined,
        }}
      />
    </div>
  )
}
