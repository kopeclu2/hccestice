import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Match, Post } from '@/payload-types'
import configPromise from '@payload-config'

import type { MatchDetail } from '../types'

import { relId } from './format'
import { pickReport, toMatchDetail } from './matchDetailView'
import { CACHE_TAGS } from './tags'

/**
 * Detail zápasu (`/zapasy/[slug]`) — fetchery. Mapování na view-model
 * je čisté a žije v `matchDetailView.ts`.
 */

/**
 * Pole reportáže, která detail zápasu čte. `_status` a `publishedAt`
 * rozhodují, jestli reportáž vůbec ukázat a která je nejnovější; zbytek
 * je karta. Obsah článku (`content`, `legacyHtml`) by payload zbytečně
 * nafoukl — a ten se pak serializuje do cache.
 */
const REPORT_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  meta: { description: true },
  heroImage: true,
  _status: true,
  publishedAt: true,
} as const

/**
 * Reportáž k zápasu. Vazba je dvojí (`matches.report` ručně, `posts.match`
 * ze synchronizace) a rozhodnutí je v `pickReport`: publikovaná
 * `matches.report`, jinak nejnovější publikovaný článek s `match` na tenhle
 * zápas, jinak nic.
 *
 * Sdílený helper — volá ho detail zápasu i karta zápasu (`fetchMatchCard`),
 * takže žádné místo neodkáže na koncept (jeho URL je 404).
 */
export const resolveReport = async (match: Match): Promise<Post | null> => {
  const payload = await getPayload({ config: configPromise })

  // `matches.report` bývá populované (depth ≥ 1), ale nespoléhá se na to:
  // číslo se dotáhne, jinak by se publikovaná reportáž tiše ztratila.
  let linked = match.report ?? null
  if (typeof linked === 'number') {
    linked = await payload
      .findByID({ collection: 'posts', id: linked, depth: 1, select: REPORT_SELECT })
      .then((doc) => doc as Post)
      .catch(() => null)
  }

  // Druhý dotaz jen když ruční vazba nestačí.
  if (typeof linked === 'object' && linked?._status === 'published') return linked

  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ match: { equals: match.id } }, { _status: { equals: 'published' } }] },
    sort: '-publishedAt',
    limit: 5,
    depth: 1,
    select: REPORT_SELECT,
  })
  return pickReport(linked, docs as Post[])
}

/** Slugy všech zápasů (i naplánovaných a zrušených) — pro `generateStaticParams`. */
export const fetchMatchSlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'matches',
    limit: 0,
    depth: 0,
    pagination: false,
    select: { slug: true },
  })
  return docs.map((doc) => doc.slug).filter((slug): slug is string => Boolean(slug))
})

/**
 * Detail zápasu podle slugu (`null` = neexistuje → `notFound()`).
 *
 * Cachuje se tagem, ne časem — viz AGENTS.md („Cache a renderovací režimy"):
 * tag `matches-list` (zápas, sezóna, soupeř, hráči) i `posts-list`
 * (publikovaná reportáž) a `revalidate` jako záchranná síť, protože
 * `unstable_cache` bez něj žije rok. `new Date()` tu není nikde — nic
 * relativního k „teď" se nepočítá, naplánovaný zápas řeší odpočet na klientu.
 */
const loadMatchDetail = unstable_cache(
  async (slug: string): Promise<MatchDetail | null> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'matches',
      where: { slug: { equals: slug } },
      limit: 1,
      // 2: zápas → soupeř → logo, zápas → galerie → cover.
      depth: 2,
      // Sestava (`lineup`) se na detailu nepoužívá a je to nejdelší pole.
      select: {
        slug: true,
        date: true,
        season: true,
        opponent: true,
        home: true,
        venue: true,
        competition: true,
        status: true,
        scoreOurs: true,
        scoreOpp: true,
        overtime: true,
        shootout: true,
        thirds: true,
        goals: true,
        penalties: true,
        stats: true,
        ahl: { hasReport: true },
        report: true,
        gallery: true,
      },
      populate: {
        opponents: { name: true, logo: true, city: true, slug: true },
        players: { name: true },
        seasons: { slug: true, startYear: true },
        galleries: { slug: true, title: true },
        // `url` se skládá z `filename` až v afterRead hooku — bez něj v `select`
        // by zůstal prázdný a `next/image` by spadl na chybějícím `src`.
        media: { url: true, filename: true, alt: true, width: true, height: true, updatedAt: true },
        posts: REPORT_SELECT,
      },
    })

    // `select` zúžil dokument; `toMatchDetail` čte jen vybraná pole.
    const match = docs[0] as Match | undefined
    if (!match) return null

    return toMatchDetail(match, await resolveReport(match))
  },
  // `v2` = view-model s časovou osou (`timeline`), `v3` = výsledek `otLoss`;
  // stará entry by stránku shodila nebo lhala, takže změna tvaru znamená
  // novou verzi klíče.
  ['match-detail', 'v3'],
  { tags: [CACHE_TAGS.matches, CACHE_TAGS.posts], revalidate: 3600 },
)

export const fetchMatchDetail = cache(loadMatchDetail)

/**
 * Slug zápasu, ke kterému reportáž patří — pro odkaz „Detail zápasu".
 * `post.match` (populované, depth 2) má přednost; reportáže bez něj
 * (archiv 2023/24 má vazbu jen z druhé strany, `matches.report`) se
 * dohledají dotazem na zápas s `report = post.id`.
 */
export const fetchMatchSlugForPost = cache(async (post: Post): Promise<string | null> => {
  if (typeof post.match === 'object' && post.match) return post.match.slug ?? null

  const payload = await getPayload({ config: configPromise })
  const matchId = relId(post.match)
  if (matchId) {
    const match = await payload
      .findByID({ collection: 'matches', id: matchId, depth: 0, select: { slug: true } })
      .catch(() => null)
    return match?.slug ?? null
  }

  const { docs } = await payload.find({
    collection: 'matches',
    where: { report: { equals: post.id } },
    sort: '-date',
    limit: 1,
    depth: 0,
    select: { slug: true },
  })
  return docs[0]?.slug ?? null
})
