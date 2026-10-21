import type { Where } from 'payload'

import { CLUB_EMAIL } from '@/landing/content'
import { LANDING_SLUGS } from '@/landing/data/landingSlugs'
import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { fetchSiteConfig } from '@/landing/data/site'
import { CACHE_TAGS } from '@/landing/data/tags'
import { formatFullDate, formatFullDateTime } from '@/lib/datetime'
import { getServerSideURL } from '@/lib/getURL'
import { buildLlmsTxt, type LlmsLink } from '@/lib/llmsTxt'
import { htmlPlainText, snippet } from '@/lib/plainText'
import { routes } from '@/lib/routes'
import {
  isUntimedMatch,
  normalizeRedirectPath,
  redirectSourceSet,
  type SitemapDoc,
} from '@/lib/sitemapEntries'

/**
 * `llms.txt` podle konvence llmstxt.org — strukturovaný rozcestník obsahu
 * pro AI asistenty a crawlery. Skládání textu je v `lib/llmsTxt.ts`, tady
 * jsou jen dotazy.
 *
 * Záměrně vlastní route handler, ne `payload-plugin-llms-txt`: ten neumí
 * flattenovat blokové layouty do Markdownu, a `pages` jsou v tomhle projektu
 * blokové. Stejný důvod, proč tady **není** `llms-full.txt` — plnotextový
 * export by potřeboval vlastní blok→Markdown serializér.
 *
 * Cachuje se **tagem**, ne časem, stejně jako sitemapy vedle
 * (`src/app/(landing)/(sitemaps)/*`). `unstable_cache` bez
 * `options.revalidate` má TTL jeden rok, takže invalidace v
 * `revalidatePage` / `revalidatePost` není optimalizace, ale podmínka
 * funkčnosti. Zápasy mění tag `matches-list`, který ho obnovuje taky;
 * `new Date()` do cachované funkce nesmí, proto hranici „od teď" počítá
 * `scheduleFrom()` mimo ni a vstupuje do klíče argumentem.
 */

/** Strop počtu položek v sekcích — rozcestník, ne export databáze. */
const RECENT_POSTS = 30
const RECENT_GALLERIES = 10
const RECENT_RESULTS = 5
const NEXT_FIXTURES = 5

/** Popis položky — jedna řádka, bez markupu z legacy importu. */
const describe = (raw?: string | null): string | null =>
  snippet(htmlPlainText(raw ?? ''), 160) || null

/** Začátek aktuální hodiny: hranice „od teď" pro rozlosování (viz komentář výš). */
const scheduleFrom = (): string => {
  const boundary = new Date()
  boundary.setMinutes(0, 0, 0)
  return boundary.toISOString()
}

const getLlmsTxt = cachedQuery(
  async (from: string): Promise<string> => {
    const payload = await getPayloadClient()
    const siteUrl = getServerSideURL()

    const published: Where = { _status: { equals: 'published' } }
    const query = {
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: published,
    } as const

    const [pages, posts, galleries, played, scheduled, redirects, site] = await Promise.all([
      payload.find({
        ...query,
        collection: 'pages',
        select: { slug: true, title: true, meta: true },
      }),
      payload.find({
        ...query,
        collection: 'posts',
        sort: '-publishedAt',
        select: { slug: true, title: true, excerpt: true, meta: true },
      }),
      // `galleries` nemá verzování, takže `where: { _status … }` ze `query`
      // by dotaz shodil (`QueryError`) — proto vlastní, bez filtru.
      payload.find({
        collection: 'galleries',
        overrideAccess: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        sort: '-date',
        select: { slug: true, title: true, date: true },
      }),
      // `matches` verzování nemá (viz galerie výš).
      payload.find({
        collection: 'matches',
        overrideAccess: false,
        depth: 0,
        limit: RECENT_RESULTS * 2,
        pagination: false,
        sort: '-date',
        where: { status: { equals: 'played' } },
        select: { slug: true, displayTitle: true, date: true, scoreOurs: true, scoreOpp: true },
      }),
      payload.find({
        collection: 'matches',
        overrideAccess: false,
        depth: 0,
        limit: NEXT_FIXTURES * 3,
        pagination: false,
        sort: 'date',
        where: {
          and: [{ status: { equals: 'scheduled' } }, { date: { greater_than_equal: from } }],
        },
        select: { slug: true, displayTitle: true, date: true },
      }),
      // Dokument, jehož cesta je v `redirects.from`, se přesměruje (3xx) —
      // v rozcestníku by to byl odkaz na přesměrování, stejně jako v sitemapě.
      payload.find({
        collection: 'redirects',
        depth: 0,
        limit: 0,
        pagination: false,
        select: { from: true },
      }),
      fetchSiteConfig(),
    ])

    const redirected = redirectSourceSet(redirects.docs.map(({ from: source }) => source))
    const live = (path: string): boolean => !redirected.has(normalizeRedirectPath(path))

    // Titulek zápasu se v adminu odděluje malým „x", web píše „×".
    const matchTitle = (title?: string | null): string => (title ?? 'Zápas').replace(/ x /, ' × ')

    const pageLinks: LlmsLink[] = pages.docs
      .filter((page) => Boolean(page.slug))
      // `home` je na `/` a je to zároveň landing page — v rozcestníku
      // by jen duplikovala kořen webu.
      .filter((page) => page.slug !== 'home')
      // Legacy dokumenty přebité ručně psanou routou (`/sponzori`,
      // `/historie-klubu`…) jsou v sekci „Sekce webu".
      .filter((page) => !LANDING_SLUGS.has(page.slug as string))
      .filter((page) => live(routes.page(page.slug)))
      .map((page) => ({
        path: routes.page(page.slug),
        title: page.title ?? (page.slug as string),
        note: describe(page.meta?.description),
      }))

    // Článek bez popisku do rozcestníku nepatří: odkaz bez řádku, o čem je,
    // modelu nic neřekne a vytlačil by užitečnější.
    const postLinks: LlmsLink[] = posts.docs
      .filter((post) => Boolean(post.slug) && live(routes.post(post.slug)))
      .map((post) => ({
        path: routes.post(post.slug),
        title: post.title ?? post.slug,
        note: describe(post.excerpt || post.meta?.description),
      }))
      .filter((post) => post.note)
      .slice(0, RECENT_POSTS)

    // Detaily fotoalb jsou veřejné stránky, ale dotazy výš je nevrátí —
    // stejná mezera, jakou měla sitemapa (viz `gallery-sitemap.xml`).
    const galleryLinks: LlmsLink[] = galleries.docs
      .filter((gallery) => Boolean(gallery.slug) && live(routes.gallery(gallery.slug)))
      .slice(0, RECENT_GALLERIES)
      .map((gallery) => ({
        path: routes.gallery(gallery.slug),
        title: gallery.title ?? gallery.slug,
        note: gallery.date ? formatFullDate(gallery.date) : null,
      }))

    const results: LlmsLink[] = played.docs
      .filter((match) => Boolean(match.slug) && live(routes.match(match.slug as string)))
      .slice(0, RECENT_RESULTS)
      .map((match) => ({
        path: routes.match(match.slug as string),
        title: matchTitle(match.displayTitle),
        note: [
          match.date ? formatFullDate(match.date) : null,
          match.scoreOurs != null && match.scoreOpp != null
            ? `skóre ${match.scoreOurs}:${match.scoreOpp}`
            : null,
        ]
          .filter(Boolean)
          .join(', '),
      }))

    const fixtures: LlmsLink[] = scheduled.docs
      .filter((match) => Boolean(match.slug) && !isUntimedMatch(match as SitemapDoc))
      .filter((match) => live(routes.match(match.slug as string)))
      .slice(0, NEXT_FIXTURES)
      .map((match) => ({
        path: routes.match(match.slug as string),
        title: matchTitle(match.displayTitle),
        note: match.date ? formatFullDateTime(match.date) : null,
      }))

    return buildLlmsTxt({
      siteUrl,
      email: site.contactEmail ?? CLUB_EMAIL,
      pages: pageLinks,
      posts: postLinks,
      galleries: galleryLinks,
      results,
      fixtures,
    })
  },
  // Pojistka pod tagem — bez `revalidate` má `unstable_cache` TTL jeden rok.
  // Hodina, ne den: „nejbližší zápasy" se s časem posouvají (viz `scheduleFrom`).
  {
    key: 'llms-txt',
    version: 'v2',
    tags: [CACHE_TAGS.llmsTxt, CACHE_TAGS.matches, CACHE_TAGS.redirects],
    revalidate: 3600,
  },
)

/**
 * Route handlery jsou od Next 15 **dynamické by default**
 * (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`,
 * historie verzí), takže se tenhle handler spustí na každý request —
 * cachovaná je jen jeho datová část. Bez explicitní hlavičky by odpověď
 * neměla `Cache-Control` vůbec a crawler by ji nemohl cachovat ani na
 * minutu. `stale-while-revalidate` proto, aby první request po invalidaci
 * tagu nikoho nezdržel.
 */
export async function GET() {
  const body = await getLlmsTxt(scheduleFrom())

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
