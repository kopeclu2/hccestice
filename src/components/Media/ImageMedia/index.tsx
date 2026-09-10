'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * Placeholder pod obrázkem, který se ještě nenačetl.
 *
 * Byl tu 4kB base64 PNG. Next ho u `placeholder="blur"` nevkládá do
 * bundlu jednou, ale **vypisuje do inline `style` každého `<img>`**, takže
 * na mřížce dvanácti karet to bylo ~48 kB HTML navíc a v mozaice fotoalba
 * (60 dlaždic v první dávce) ~240 kB. Nahradilo ho 43bajtové GIF v barvě
 * `--color-pine`, na které stojí i pozadí dlaždic — vizuálně to dělá
 * totéž, co dělal rozmazaný šum, protože přes něj jde stejně `object-cover`
 * fotka.
 */
const placeholderBlur =
  'data:image/gif;base64,R0lGODlhAQABAPAAAA8qGgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

/**
 * ImageMedia
 *
 * This component passes a **relative** `src` (e.g. `/media/...`) to Next.js Image.
 * The `getMediaUrl` utility constructs the full URL by prepending the base URL from env vars
 * (NEXT_PUBLIC_SERVER_URL). Next.js then optimizes this using `remotePatterns` configured
 * in next.config.js — no custom `loader` needed.
 *
 * Flow:
 *   1. Resource URL from Payload: `/media/image-123.jpg`
 *   2. getMediaUrl() adds base URL: `https://yourdomain.com/media/image-123.jpg`
 *   3. Next.js Image optimizes via remotePatterns: `/_next/image?url=...&w=1200&q=75`
 *
 * If your storage/plugin returns **external CDN URLs** (e.g. `https://cdn.example.com/...`),
 * choose ONE of the following:
 *   A) Allow the remote host in next.config.js:
 *      images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
 *   B) Provide a **custom loader** for CDN-specific transforms:
 *      const imageLoader: ImageLoader = ({ src, width, quality }) =>
 *        `https://cdn.example.com${src}?w=${width}&q=${quality ?? 75}`
 *      <Image loader={imageLoader} src="/media/hero.jpg" width={1200} height={600} alt="" />
 *   C) Skip optimization:
 *      <Image unoptimized src="https://cdn.example.com/hero.jpg" width={1200} height={600} alt="" />
 *
 * TL;DR: Template uses relative URLs + getMediaUrl() to construct full URLs, then relies on
 * remotePatterns for optimization. Only add `loader` if using external CDNs with custom transforms.
 */

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getMediaUrl(url, cacheTag)
  }

  /**
   * `priority` je v Next 16 deprecated (viz `image.md`, sekce `priority`)
   * a hlavně negeneruje `fetchpriority="high"` na `<img>` — jen vkládá
   * `<link rel="preload">`. Lighthouse proto u LCP obrázku hlásil
   * `priorityHinted: false`. Dokumentace pro tenhle případ doporučuje
   * `loading="eager"` + `fetchPriority="high"`, takže prop necháváme
   * v API komponenty (volající říká „tohle je LCP"), ale překládáme ji
   * na to, co Next 16 skutečně respektuje.
   */
  const isPriority = Boolean(priority)
  const loading = loadingFromProps ?? (isPriority ? 'eager' : 'lazy')

  /**
   * `sizes` musí být **délka** (`px`, `vw`, `em`), ne deskriptor `w`.
   * Dřív se tu z breakpointů skládalo `(max-width: 640px) 1280w, …`,
   * což je neplatná hodnota — prohlížeč celý atribut zahodil a spadl na
   * `100vw`. Default je proto `100vw` napsané explicitně; konkrétní
   * šířku si volající předá `size` (`PhotoTile` to tak dělá).
   */
  const sizes = sizeFromProps ?? '100vw'

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        fetchPriority={isPriority ? 'high' : undefined}
        loading={loading}
        sizes={sizes}
        src={src}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
