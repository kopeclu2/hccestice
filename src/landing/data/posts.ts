import type { Match, Post } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { ArticleAuthor, ArticleDetail, ArticleScoreboard, Photo, PostCard } from '../types'

import {
  formatFullDate,
  formatLongDate,
  dropTitleEcho,
  echoesTitle,
  htmlPlainText,
  htmlWordCount,
  lexicalPlainText,
  lexicalWordCount,
  looksLikeProse,
  postPath,
  readingLabel,
  relId,
  snippet,
  toPhoto,
  uploadToPhoto,
} from './format'
import { fetchSiteConfig } from './site'

/** Články — fetchery pro Aktuality, widget Články, Vypíchnutý článek a detail. */

/** Štítek karty podle typu článku. */
export const POST_TYPE_LABEL: Record<string, string> = {
  news: 'Novinky',
  report: 'Zápasy',
  roster: 'Soupiska',
  schedule: 'Rozpis',
  standings: 'Výsledky',
}

export const postHref = (post: Post): string | null => postPath(post.slug)

/** Výchozí obrázek článků ze siteConfig — pro články bez vlastní fotky. */
export const fetchDefaultPostPhoto = cache(async (): Promise<Photo | null> => {
  const site = await fetchSiteConfig()
  return uploadToPhoto(site.defaultPostImage)
})

export const postTag = (post: Post): string =>
  POST_TYPE_LABEL[post.type ?? 'news'] ?? 'Novinky'

/**
 * Úryvek pro kartu: ruční perex, pak SEO popis, jinak začátek obsahu.
 * Většina naimportovaných článků perex ani popis nemá, takže bez fallbacku
 * z obsahu by textové karty zůstaly jen s titulkem.
 *
 * Fallback z obsahu se bere jen u prózy (novinky, reportáže). Soupisky, rozpisy
 * a tabulky jsou v legacy HTML tabulky, ze kterých vypadne „Obdržených gólů: 0
 * Obdržených gólů: 0…" — tam je lepší nechat kartu bez textu.
 */
export const postSummary = (post: Post, maxChars = 180): string | null => {
  // Perex i SEO popis jsou u naimportovaných článků často celý HTML odstavec
  // (`<p><span style="…">…</span></p>`), takže i ruční hodnota jde přes čištění.
  const manual = htmlPlainText(post.excerpt || post.meta?.description || '')
  if (manual) return snippet(manual, maxChars)
  if (post.type && !['news', 'report'].includes(post.type)) return null

  const text =
    post.contentType === 'html' && post.legacyHtml
      ? htmlPlainText(post.legacyHtml)
      : lexicalPlainText(post.content)
  // Hodnotí se až výsledný úryvek, ne celý článek — próza, která končí
  // tabulkou výsledků, by jinak o úryvek přišla.
  const result = snippet(dropTitleEcho(text, post.title), maxChars)
  if (!looksLikeProse(result)) return null
  // úryvek, který jen zopakuje titulek, na kartě nic nepřidá
  if (echoesTitle(result, post.title)) return null
  return result || null
}

/** Payload dokument → karta článku (bez vlastní fotky výchozí obrázek). */
export const toPostCard = (post: Post, defaultPhoto: Photo | null = null): PostCard => ({
  id: post.id,
  title: post.title,
  href: postHref(post),
  dateLabel: post.publishedAt ? formatFullDate(post.publishedAt) : '',
  tag: postTag(post),
  excerpt: postSummary(post),
  photo:
    (typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null) ??
    defaultPhoto,
})

/** Nejnovější publikované články (novinky + reportáže). */
export const fetchLatestPosts = cache(async (limit: number): Promise<Post[]> => {
  const payload = await getPayload({ config: configPromise })
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
    const payload = await getPayload({ config: configPromise })
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
}

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
 */
const queryPostsPage = unstable_cache(
  async (options: {
    page: number
    perPage?: number
    type?: string | null
    /** Zapnuté fotky na kartách (`siteConfig.postsListShowPhoto`). */
    withPhotos?: boolean
  }): Promise<PostsPage> => {
    const payload = await getPayload({ config: configPromise })
    const perPage = options.perPage ?? 9
    const and: Array<Record<string, unknown>> = [{ _status: { equals: 'published' } }]
    if (options.type) and.push({ type: { equals: options.type } })

    const query = (page: number) =>
      payload.find({
        collection: 'posts',
        where: { and } as never,
        sort: '-publishedAt',
        limit: perPage,
        page,
        depth: 1,
      })

    let result = await query(Math.max(1, options.page))
    // Přetečená strana (?page=99) → poslední existující
    if (result.docs.length === 0 && options.page > result.totalPages) {
      result = await query(Math.max(1, result.totalPages))
    }

    // Výchozí obrázek se dosazuje jen se zapnutými fotkami — u textových karet
    // se stejně nevykreslí a dotaz na siteConfig by byl zbytečný.
    const defaultPhoto = options.withPhotos ? await fetchDefaultPostPhoto() : null

    return {
      cards: result.docs.map((doc) => toPostCard(doc, defaultPhoto)),
      totalDocs: result.totalDocs,
      totalPages: Math.max(1, result.totalPages),
      page: result.page ?? 1,
    }
  },
  ['posts-page'],
  { tags: ['posts-list'] },
)

export const fetchPostsPage = cache(queryPostsPage)

/** Článek pro vypíchnutou kartu (s heroImage). */
export const fetchPost = cache(async (postId: number): Promise<Post | null> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findByID({ collection: 'posts', id: postId, depth: 1 })
})

/* ── Detail článku (/aktuality/[slug]) ───────────────────────────────────── */

/** Slugy publikovaných článků — pro generateStaticParams detailu. */
export const fetchPostSlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayload({ config: configPromise })
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
export const fetchPostBySlug = cache(
  async (slug: string, draft: boolean): Promise<Post | null> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'posts',
      draft,
      overrideAccess: draft,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return docs[0] ?? null
  },
)

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

const toArticleAuthor = (post: Post): ArticleAuthor => {
  const person = typeof post.authorPerson === 'object' ? post.authorPerson : null
  // Fallback na uživatele z pole Autoři (jméno, portrét, e-mail z kolekce users)
  const user = post.populatedAuthors?.[0] ?? null
  const name = person?.name ?? user?.name ?? 'HC Čestice'
  return {
    name,
    initials: initialsOf(name) || 'HC',
    role: person?.role ?? user?.role ?? null,
    note: person?.note ?? null,
    email: person?.email ?? user?.email ?? null,
    photo: person ? uploadToPhoto(person.photo) : uploadToPhoto(user?.photo),
  }
}

/** Výsledková tabule z odehraného zápasu; null = nelze sestavit. */
const toScoreboard = (match: Match): ArticleScoreboard | null => {
  if (match.status !== 'played' || match.scoreOurs == null || match.scoreOpp == null) return null
  const opponent = typeof match.opponent === 'object' && match.opponent ? match.opponent.name : 'Soupeř'
  const weAreHome = Boolean(match.home)
  return {
    kicker: ['Zápasové zpravodajství', match.competition].filter(Boolean).join(' · '),
    metaLine: [match.venue, formatLongDate(match.date)].filter(Boolean).join(' · '),
    homeName: weAreHome ? 'HC Čestice' : opponent,
    awayName: weAreHome ? opponent : 'HC Čestice',
    homeScore: weAreHome ? match.scoreOurs : match.scoreOpp,
    awayScore: weAreHome ? match.scoreOpp : match.scoreOurs,
    weAreHome,
    weWon: match.scoreOurs > match.scoreOpp,
    thirds: (match.thirds ?? []).map((third) =>
      weAreHome ? `${third.ours}:${third.opp}` : `${third.opp}:${third.ours}`,
    ),
    suffix: match.shootout ? 'sn' : match.overtime ? 'pp' : '',
  }
}

/** Payload dokument → view-model detailu, včetně fallbacků hero varianty. */
export const toArticleDetail = (post: Post, defaultPhoto: Photo | null = null): ArticleDetail => {
  const photo =
    (typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null) ??
    defaultPhoto
  const match = typeof post.match === 'object' ? post.match : null
  const scoreboard = match ? toScoreboard(match) : null

  // Fallbacky: varianta se bez potřebných dat bezpečně sníží na typografickou.
  let variant = post.heroVariant ?? 'foto'
  if (variant === 'zapas' && !scoreboard) variant = 'typograficke'
  if ((variant === 'foto' || variant === 'rozdelene' || variant === 'panel') && !photo) {
    variant = 'typograficke'
  }

  const words =
    post.contentType === 'html' && post.legacyHtml
      ? htmlWordCount(post.legacyHtml)
      : lexicalWordCount(post.content)

  return {
    id: post.id,
    slug: post.slug ?? '',
    title: post.title,
    titleHighlight:
      post.titleHighlight && post.title.includes(post.titleHighlight)
        ? post.titleHighlight
        : null,
    variant,
    badge: postTag(post),
    excerpt: post.excerpt ?? null,
    photo,
    photoCaption: post.photoCaption ?? null,
    dateLabel: post.publishedAt ? formatLongDate(post.publishedAt) : '',
    readingLabel: readingLabel(words),
    author: toArticleAuthor(post),
    scoreboard: variant === 'zapas' ? scoreboard : null,
    tags: (post.categories ?? [])
      .map((category) => (typeof category === 'object' ? category.title : null))
      .filter((title): title is string => Boolean(title)),
    showRelated: post.showRelated ?? true,
  }
}

/** Karty souvisejících článků — ruční výběr, dofiltrování dle kategorií. */
export const fetchRelatedPostCards = cache(
  async (post: Post, limit = 3): Promise<PostCard[]> => {
    const payload = await getPayload({ config: configPromise })

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

    const categoryIds = (post.categories ?? [])
      .map(relId)
      .filter((id): id is number => Boolean(id))
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
  },
)
