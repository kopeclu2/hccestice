import type { Gallery, Season } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { GalleryCard } from '../types'

import { formatFullDate, toPhoto, uploadToPhoto } from './format'
import { seasonShortLabel } from './seasons'

/** Galerie — fetchery pro mozaiku Fotoalba a widgety Galerie. */

/** Galerie podle id (s fotkami). */
export const fetchGallery = cache(async (galleryId: number): Promise<Gallery | null> => {
  const payload = await getPayload({ config: configPromise })
  const gallery = await payload.findByID({ collection: 'galleries', id: galleryId, depth: 1 })
  return gallery ?? null
})

/**
 * Dokument galerie ve tvaru, ze kterého se skládá karta. `photos` je
 * `unknown[]`, protože podle selectu nese buď jen `id` řádků (výpis, mozaika),
 * nebo i populovaný `image` (widgety s `depth: 1`).
 */
type GalleryCardDoc = Pick<Gallery, 'id' | 'title' | 'date'> & {
  slug?: Gallery['slug']
  season?: number | Season | null
  cover?: Gallery['cover']
  photos?: Array<{ image?: unknown }> | unknown[] | null
}

const LIST_SELECT = {
  title: true,
  slug: true,
  date: true,
  season: true,
  cover: true,
  photos: { id: true },
} as const

/**
 * Dokument galerie → karta. Jediný mapper pro výpis, widgety i mozaiku
 * Fotoalba — dřív byly dva a rozcházely se: jeden uměl cover fallback,
 * druhý `href` a sezónu, takže mozaika neměla jak dostat obojí.
 *
 * Cover padá na první fotku, ale jen když je populovaná (`depth: 1` bez
 * zúžení `photos`). U zúženého selectu zůstane `null` a dorovná ho
 * `resolveMissingCovers` — načítat kvůli obálce stovky media dokumentů
 * u každé galerie ve výpisu se nevyplatí.
 */
export const toGalleryCard = (gallery: GalleryCardDoc): GalleryCard => {
  const firstPhoto = (gallery.photos as Array<{ image?: unknown }> | null | undefined)?.[0]?.image
  return {
    id: gallery.id,
    title: gallery.title,
    dateLabel: gallery.date ? formatFullDate(gallery.date) : '',
    photoCount: gallery.photos?.length ?? 0,
    cover:
      typeof gallery.cover === 'object' && gallery.cover
        ? toPhoto(gallery.cover)
        : uploadToPhoto(firstPhoto as Parameters<typeof uploadToPhoto>[0]),
    href: gallery.slug ? `/fotogalerie/${gallery.slug}` : null,
    seasonLabel:
      typeof gallery.season === 'object' && gallery.season
        ? seasonShortLabel(gallery.season)
        : null,
  }
}

/** Karty galerií pro widget (cover ?? první fotka, počet fotek). */
export const fetchGalleryCards = cache(
  async (options: { seasonId?: number | null; limit: number }): Promise<GalleryCard[]> => {
    const payload = await getPayload({ config: configPromise })
    const and: Array<Record<string, unknown>> = [{ date: { exists: true } }]
    if (options.seasonId) and.push({ season: { equals: options.seasonId } })

    const { docs } = await payload.find({
      collection: 'galleries',
      where: { and } as never,
      sort: '-date',
      limit: options.limit,
      depth: 1,
    })

    return docs.map(toGalleryCard)
  },
)

/* ── Mozaika Fotoalba (homepage) ─────────────────────────────────────────── */

/**
 * Doplní obálky kartám, kterým chybí — `cover` na kolekci není povinný, takže
 * album bez úvodní fotky by v mozaice bylo prázdná zelená plocha.
 *
 * Dva levné dotazy (`depth: 0` na id fotek, pak jeden `find` nad `media`)
 * místo populace všech fotek: alba mají běžně desítky až stovky snímků
 * a tohle běží na nejteplejší stránce webu.
 */
async function resolveMissingCovers(
  payload: Awaited<ReturnType<typeof getPayload>>,
  cards: GalleryCard[],
): Promise<GalleryCard[]> {
  const missing = cards.filter((card) => !card.cover).map((card) => card.id)
  if (missing.length === 0) return cards

  const { docs } = await payload.find({
    collection: 'galleries',
    where: { id: { in: missing } },
    limit: missing.length,
    depth: 0,
    select: { photos: { image: true } },
  })

  const firstImageId = new Map<number, number>()
  for (const doc of docs as Array<{ id: number; photos?: Array<{ image?: unknown }> | null }>) {
    const image = doc.photos?.[0]?.image
    if (typeof image === 'number') firstImageId.set(doc.id, image)
  }
  if (firstImageId.size === 0) return cards

  const { docs: media } = await payload.find({
    collection: 'media',
    where: { id: { in: [...new Set(firstImageId.values())] } },
    limit: firstImageId.size,
    depth: 0,
  })
  const photoById = new Map(media.map((item) => [item.id, toPhoto(item)]))

  return cards.map((card) => {
    if (card.cover) return card
    const imageId = firstImageId.get(card.id)
    return { ...card, cover: (imageId && photoById.get(imageId)) || null }
  })
}

/**
 * Galerie pro mozaiku Fotoalba — nejnovější alba, případně s připnutým
 * v čele (pole „Připnutá galerie" na bloku).
 *
 * Alba bez data (tematická, legacy import) se do sekce o sezóně neberou,
 * stejně jako je nebere widget Galerie.
 */
export const fetchAlbumGalleries = cache(
  async (options: { limit: number; pinnedId?: number | null }): Promise<GalleryCard[]> => {
    const payload = await getPayload({ config: configPromise })

    const [latest, pinned] = await Promise.all([
      payload.find({
        collection: 'galleries',
        where: { date: { exists: true } },
        sort: '-date',
        limit: options.limit,
        depth: 1,
        select: LIST_SELECT,
      }),
      options.pinnedId
        ? payload
            .findByID({
              collection: 'galleries',
              id: options.pinnedId,
              depth: 1,
              select: LIST_SELECT,
            })
            .catch(() => null)
        : null,
    ])

    const docs = [...(pinned ? [pinned] : []), ...(latest.docs as GalleryCardDoc[])]
    const unique = docs.filter(
      (doc, index) => docs.findIndex((other) => other.id === doc.id) === index,
    )

    return resolveMissingCovers(payload, unique.slice(0, options.limit).map(toGalleryCard))
  },
)

/* ── Výpis /fotogalerie ──────────────────────────────────────────────────── */

/** Jedna strana výpisu /fotogalerie. */
export type GalleriesPage = {
  cards: GalleryCard[]
  totalDocs: number
  totalPages: number
  page: number
}

/**
 * Stránkovaný výpis galerií s volitelným filtrem sezóny.
 *
 * Galerie bez data (legacy/tematická alba) tvoří ocas výpisu — Postgres
 * by je při sortu `-date` řadil první (NULLS FIRST), proto dva segmenty:
 * datované stránkované nativně, bez data dotažené celé a doplněné za ně.
 */
export const fetchGalleriesPage = cache(
  async (options: {
    page: number
    perPage?: number
    seasonId?: number | null
  }): Promise<GalleriesPage> => {
    const payload = await getPayload({ config: configPromise })
    const perPage = options.perPage ?? 9
    const seasonAnd = options.seasonId ? [{ season: { equals: options.seasonId } }] : []

    const datedQuery = (page: number) =>
      payload.find({
        collection: 'galleries',
        where: { and: [...seasonAnd, { date: { exists: true } }] } as never,
        sort: '-date',
        limit: perPage,
        page,
        depth: 1,
        select: LIST_SELECT,
      })

    const requestedPage = Math.max(1, options.page)
    const [datedFirst, datelessResult] = await Promise.all([
      datedQuery(requestedPage),
      payload.find({
        collection: 'galleries',
        where: { and: [...seasonAnd, { date: { exists: false } }] } as never,
        sort: '-createdAt',
        limit: 0,
        depth: 1,
        select: LIST_SELECT,
      }),
    ])
    const dateless = datelessResult.docs as GalleryCardDoc[]

    const totalDocs = datedFirst.totalDocs + dateless.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / perPage))
    // Přetečená strana (?page=99) → poslední existující
    const page = Math.min(requestedPage, totalPages)
    const dated = page === requestedPage ? datedFirst : await datedQuery(page)

    const start = (page - 1) * perPage
    const datedDocs = (start < dated.totalDocs ? dated.docs : []) as GalleryCardDoc[]
    const tailOffset = Math.max(0, start - dated.totalDocs)
    const tail = dateless.slice(tailOffset, tailOffset + perPage - datedDocs.length)

    return {
      cards: [...datedDocs, ...tail].map(toGalleryCard),
      totalDocs,
      totalPages,
      page,
    }
  },
)

/* ── Detail galerie (/fotogalerie/[slug]) ────────────────────────────────── */

/** Galerie podle slugu, s populovanými fotkami. */
export const fetchGalleryBySlug = cache(async (slug: string): Promise<Gallery | null> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'galleries',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

/** Slugy všech galerií — pro generateStaticParams detailu. */
export const fetchGallerySlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'galleries',
    limit: 0,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
})
