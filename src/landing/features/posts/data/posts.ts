import 'server-only'

import { cache } from 'react'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { fetchSiteConfig } from '@/landing/data/site'
import { CACHE_TAGS } from '@/landing/data/tags'
import type { PostCard } from '@/landing/features/posts/types'
import { toPostCard } from '@/landing/features/posts/view/posts'
import { uploadToPhoto } from '@/landing/lib/media'
import { relId } from '@/landing/lib/payload'
import type { Photo } from '@/landing/types'
import type { Post } from '@/payload-types'

/** Články — fetchery pro Aktuality, widget Články, Vypíchnutý článek a detail. */

/** Výchozí obrázek článků ze siteConfig — pro články bez vlastní fotky. */
export const fetchDefaultPostPhoto = cache(async (): Promise<Photo | null> => {
  const site = await fetchSiteConfig()
  return uploadToPhoto(site.defaultPostImage)
})

/** Nejnovější publikované články (novinky + reportáže). */
export const fetchLatestPosts = cache(async (limit: number): Promise<Post[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ _status: { equals: 'published' } }, { type: { in: ['news', 'report'] } }],
    },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return docs
})

/** Karty článků pro widget (filtr typu a sezóny). */
export const fetchPostCards = cache(
  async (options: {
    type?: 'news' | 'report' | null
    seasonId?: number | null
    limit: number
  }): Promise<PostCard[]> => {
    const payload = await getPayloadClient()
    const and: Array<Record<string, unknown>> = [{ _status: { equals: 'published' } }]
    and.push(
      options.type ? { type: { equals: options.type } } : { type: { in: ['news', 'report'] } },
    )
    if (options.seasonId) and.push({ season: { equals: options.seasonId } })

    const { docs } = await payload.find({
      collection: 'posts',
      where: { and } as never,
      sort: '-publishedAt',
      limit: options.limit,
      depth: 1,
    })

    const defaultPhoto = await fetchDefaultPostPhoto()
    return docs.map((doc) => toPostCard(doc, defaultPhoto))
  },
)

/** Jedna strana výpisu /aktuality. */
export type PostsPage = {
  cards: PostCard[]
  totalDocs: number
  totalPages: number
  page: number
  /** `true` jen na první straně — ta má featured kartu, další ne. */
  featured: boolean
}

/**
 * První strana má featured kartu (2/3 mřížky), takže drží míň karet než
 * další strany, kde je mřížka rovnoměrná 3×N. Součet musí vyjít beze zbytku
 * (`FIRST_PAGE_COUNT` + `REST_PAGE_COUNT` je násobek tří sloupců): featured
 * karta zabere 2 sloupce + 1 normální karta = celý první řádek, každá další
 * strana pak jede v řádcích po třech.
 */
const FIRST_PAGE_COUNT = 5
const REST_PAGE_COUNT = 6

/**
 * Stránkovaný výpis publikovaných článků s volitelným filtrem typu (/aktuality).
 *
 * Dvě vrstvy cache záměrně:
 *  - `unstable_cache` **mezi requesty** (tag `posts-list`). `/aktuality` čte
 *    `searchParams`, takže je plně dynamická (`Cache-Control: no-store`) a
 *    bez tohohle šel dotaz do Postgresu při každém načtení — naměřeno
 *    `server-response-time` 539 ms proti 48 ms na prerenderované homepage.
 *    Klíč si `unstable_cache` skládá z argumentů, takže se každá kombinace
 *    stránky a filtru cachuje zvlášť.
 *  - React `cache()` **v rámci jednoho renderu**, aby stránka a její
 *    metadata nesahaly pro totéž dvakrát.
 *
 * TTL `unstable_cache` bez `options.revalidate` je rok, takže
 * `revalidateTag('posts-list')` v `revalidatePost` není optimalizace, ale
 * podmínka funkčnosti — jinak by nový článek ve výpisu nikdy nebyl.
 * `revalidate: 3600` je pod tagem jako záchranná síť pro případ, že hook
 * neproběhne (seed s `disableRevalidate`, výjimka při zápisu).
 */
export const fetchPostsPage = cachedQuery(
  async (options: {
    page: number
    type?: string | null
    /** Zapnuté fotky na kartách (`siteConfig.postsListShowPhoto`). */
    withPhotos?: boolean
  }): Promise<PostsPage> => {
    const payload = await getPayloadClient()
    const and: Array<Record<string, unknown>> = [{ _status: { equals: 'published' } }]
    if (options.type) and.push({ type: { equals: options.type } })
    const where = { and } as never

    const { totalDocs } = await payload.count({ collection: 'posts', where })
    const totalPages =
      totalDocs <= FIRST_PAGE_COUNT
        ? 1
        : 1 + Math.ceil((totalDocs - FIRST_PAGE_COUNT) / REST_PAGE_COUNT)
    // Přetečená strana (?page=99) → poslední existující
    const page = Math.min(Math.max(1, options.page), totalPages)

    /* Payload umí stránkovat jen s jednotným `limit` (skip = (page-1)*limit) —
     * s asymetrickými stranami (5, pak 6, 6, 6…) se skip na hranici 5 takhle
     * netrefí. Řeší se dotažením VŠECH záznamů od začátku po konec téhle
     * strany a ořezem posledních `REST_PAGE_COUNT` v JS. Dotaz roste s číslem
     * strany, ale výsledek je cachovaný (`unstable_cache` výš) a jde o řádově
     * stovky lehkých řádků, ne miliony. */
    const fetchCount =
      page === 1 ? FIRST_PAGE_COUNT : FIRST_PAGE_COUNT + (page - 1) * REST_PAGE_COUNT

    const result = await payload.find({
      collection: 'posts',
      where,
      sort: '-publishedAt',
      limit: fetchCount,
      page: 1,
      depth: 1,
    })
    const docs = page === 1 ? result.docs : result.docs.slice(-REST_PAGE_COUNT)

    // Výchozí obrázek se dosazuje jen se zapnutými fotkami — u textových karet
    // se stejně nevykreslí a dotaz na siteConfig by byl zbytečný.
    const defaultPhoto = options.withPhotos ? await fetchDefaultPostPhoto() : null

    return {
      cards: docs.map((doc) => toPostCard(doc, defaultPhoto)),
      totalDocs,
      totalPages,
      page,
      featured: page === 1,
    }
  },
  { key: 'posts-page', tags: [CACHE_TAGS.posts] },
)

/** Článek pro vypíchnutou kartu (s heroImage). */
export const fetchPost = cache(async (postId: number): Promise<Post | null> => {
  const payload = await getPayloadClient()
  return payload.findByID({ collection: 'posts', id: postId, depth: 1 })
})

/* ── Detail článku (/aktuality/[slug]) ───────────────────────────────────── */

/** Slugy publikovaných článků — pro generateStaticParams detailu. */
export const fetchPostSlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    draft: false,
    where: { _status: { equals: 'published' } },
    limit: 0,
    depth: 0,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
})

/** Článek podle slugu; `draft` pro live preview v adminu. */
export const fetchPostBySlug = cache(async (slug: string, draft: boolean): Promise<Post | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    draft,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
})

/** Karty souvisejících článků — ruční výběr, dofiltrování dle kategorií. */
export const fetchRelatedPostCards = cache(async (post: Post, limit = 3): Promise<PostCard[]> => {
  const payload = await getPayloadClient()

  const pickedIds = (post.relatedPosts ?? [])
    .map(relId)
    .filter((id): id is number => Boolean(id))
    .slice(0, limit)

  const picked = pickedIds.length
    ? (
        await payload.find({
          collection: 'posts',
          where: {
            and: [{ id: { in: pickedIds } }, { _status: { equals: 'published' } }],
          },
          limit: pickedIds.length,
          depth: 1,
        })
      ).docs.sort((a, b) => pickedIds.indexOf(a.id) - pickedIds.indexOf(b.id))
    : []

  const defaultPhoto = await fetchDefaultPostPhoto()

  const missing = limit - picked.length
  if (missing <= 0) return picked.map((doc) => toPostCard(doc, defaultPhoto))

  const categoryIds = (post.categories ?? []).map(relId).filter((id): id is number => Boolean(id))
  const excludeIds = [post.id, ...picked.map((doc) => doc.id)]

  const and: Array<Record<string, unknown>> = [
    { _status: { equals: 'published' } },
    { type: { in: ['news', 'report'] } },
    { id: { not_in: excludeIds } },
  ]
  if (categoryIds.length) and.push({ categories: { in: categoryIds } })

  let { docs: fill } = await payload.find({
    collection: 'posts',
    where: { and } as never,
    sort: '-publishedAt',
    limit: missing,
    depth: 1,
  })

  // Málo článků ve stejných kategoriích → doplnit nejnovějšími bez filtru.
  if (fill.length < missing && categoryIds.length) {
    const { docs: latest } = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { type: { in: ['news', 'report'] } },
          { id: { not_in: [...excludeIds, ...fill.map((doc) => doc.id)] } },
        ],
      } as never,
      sort: '-publishedAt',
      limit: missing - fill.length,
      depth: 1,
    })
    fill = [...fill, ...latest]
  }

  return [...picked, ...fill].map((doc) => toPostCard(doc, defaultPhoto))
})
