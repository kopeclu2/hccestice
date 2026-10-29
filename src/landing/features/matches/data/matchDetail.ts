import 'server-only'

import { cache } from 'react'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import type { MatchDetail } from '@/landing/features/matches/types'
import { pickReport, toMatchDetail } from '@/landing/features/matches/view/matchDetailView'
import { relId } from '@/landing/lib/payload'
import { isMatchHidden, VISIBLE_MATCH } from '@/lib/matchVisibility'
import type { Match, Post } from '@/payload-types'

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
 * `findByID` s odolností: `disableErrors` potlačí jen „nenalezeno", výpadek
 * databáze by dál odletěl. Vedlejší dohledání (karta reportáže, odkaz
 * na detail zápasu) ale nesmí shodit celou stránku, takže jiná chyba se
 * zaloguje a vrátí `null` — stejně jako dřívější `.catch(() => null)`,
 * jen už ne potichu.
 */
const findByIdOrNull = async <T>(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  label: string,
  load: () => Promise<T | null>,
): Promise<T | null> => {
  try {
    return await load()
  } catch (err) {
    payload.logger.error({ err }, `Detail zápasu: ${label} se nepodařilo načíst`)
    return null
  }
}

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
  const payload = await getPayloadClient()

  // `matches.report` bývá populované (depth ≥ 1), ale nespoléhá se na to:
  // číslo se dotáhne, jinak by se publikovaná reportáž tiše ztratila.
  let linked = match.report ?? null
  if (typeof linked === 'number') {
    const id = linked
    const doc = await findByIdOrNull(payload, 'reportáž zápasu', () =>
      payload.findByID({
        collection: 'posts',
        id,
        depth: 1,
        select: REPORT_SELECT,
        disableErrors: true,
      }),
    )
    linked = doc as Post | null
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
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where: VISIBLE_MATCH,
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
export const fetchMatchDetail = cachedQuery(
  async (slug: string): Promise<MatchDetail | null> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'matches',
      where: { and: [VISIBLE_MATCH, { slug: { equals: slug } }] },
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
  // `v2` = view-model s časovou osou (`timeline`), `v3` = výsledek `otLoss`, `v4` = třetiny jako čísla;
  // stará entry by stránku shodila nebo lhala, takže změna tvaru znamená
  // novou verzi klíče.
  { key: 'match-detail', version: 'v4', tags: [CACHE_TAGS.matches, CACHE_TAGS.posts] },
)

/**
 * Slug zápasu podle id — bloky v rich textu mají relaci na zápas (číslo,
 * nebo populovaný dokument), kdežto `fetchMatchDetail` se ptá slugem.
 * Tagovaná cache, ať se při renderu článku nedotazuje na každý blok zvlášť.
 */
export const fetchMatchSlugById = cachedQuery(
  async (matchId: number): Promise<string | null> => {
    const payload = await getPayloadClient()
    const match = await findByIdOrNull(payload, 'slug zápasu', () =>
      payload.findByID({
        collection: 'matches',
        id: matchId,
        depth: 0,
        select: { slug: true, hiddenOnWeb: true },
        disableErrors: true,
      }),
    )
    return match && !isMatchHidden(match) ? (match.slug ?? null) : null
  },
  { key: 'match-slug-by-id', version: 'v1', tags: [CACHE_TAGS.matches] },
)

/**
 * Detail zápasu pro blok v rich textu: relace `match` (id nebo populovaný
 * dokument) → tentýž view-model jako detail `/zapasy/[slug]`. Stejná cache
 * entry (`fetchMatchDetail`), takže víc bloků téhož zápasu na stránce nedělá
 * dotaz navíc. `null` = relace prázdná, zápas smazaný nebo bez slugu.
 */
export const fetchMatchDetailByRef = async (ref: unknown): Promise<MatchDetail | null> => {
  const populatedSlug =
    typeof ref === 'object' && ref && 'slug' in ref && typeof ref.slug === 'string' ? ref.slug : ''
  const matchId = relId(ref)
  const slug = populatedSlug || (matchId ? await fetchMatchSlugById(matchId) : null)
  return slug ? fetchMatchDetail(slug) : null
}

/**
 * Slug zápasu, ke kterému reportáž patří — pro odkaz „Detail zápasu".
 * `post.match` (populované, depth 2) má přednost; reportáže bez něj
 * (archiv 2023/24 má vazbu jen z druhé strany, `matches.report`) se
 * dohledají dotazem na zápas s `report = post.id`.
 */
export const fetchMatchSlugForPost = cache(async (post: Post): Promise<string | null> => {
  if (typeof post.match === 'object' && post.match) {
    return isMatchHidden(post.match) ? null : (post.match.slug ?? null)
  }

  const payload = await getPayloadClient()
  const matchId = relId(post.match)
  if (matchId) {
    const match = await findByIdOrNull(payload, 'zápas k reportáži', () =>
      payload.findByID({
        collection: 'matches',
        id: matchId,
        depth: 0,
        select: { slug: true, hiddenOnWeb: true },
        disableErrors: true,
      }),
    )
    return match && !isMatchHidden(match) ? (match.slug ?? null) : null
  }

  const { docs } = await payload.find({
    collection: 'matches',
    where: { and: [VISIBLE_MATCH, { report: { equals: post.id } }] },
    sort: '-date',
    limit: 1,
    depth: 0,
    select: { slug: true },
  })
  return docs[0]?.slug ?? null
})
