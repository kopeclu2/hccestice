import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'
import { htmlPlainText, snippet } from '@/utilities/plainText'

/**
 * `llms.txt` podle konvence llmstxt.org — strukturovaný rozcestník obsahu
 * pro AI asistenty a crawlery.
 *
 * Záměrně vlastní route handler, ne `payload-plugin-llms-txt`: ten neumí
 * flattenovat blokové layouty do Markdownu, a `pages` jsou v tomhle projektu
 * blokové. Stejný důvod, proč tady **není** `llms-full.txt` — plnotextový
 * export by potřeboval vlastní blok→Markdown serializér.
 *
 * Cachuje se **tagem**, ne časem, stejně jako sitemapy vedle
 * (`src/app/(frontend)/(sitemaps)/*`). `unstable_cache` bez
 * `options.revalidate` má TTL jeden rok, takže invalidace v
 * `revalidatePage` / `revalidatePost` není optimalizace, ale podmínka
 * funkčnosti.
 */

/** Popis položky — jedna řádka, bez markupu z legacy importu. */
const describe = (raw?: string | null): string => {
  const text = snippet(htmlPlainText(raw ?? ''), 160)
  return text ? `: ${text}` : ''
}

const getLlmsTxt = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()

    const published = { _status: { equals: 'published' } } as const
    const query = {
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: published,
    } as const

    const [pages, posts, galleries] = await Promise.all([
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
        select: { slug: true, title: true },
      }),
    ])

    const lines = [
      '# HC Čestice',
      '',
      '> Hokejový klub HC Čestice — aktuality, zápasy, soupiska, fotogalerie a historie klubu.',
      '',
    ]

    const pageLinks = pages.docs
      .filter((page) => Boolean(page.slug))
      // `home` je na `/` a je to zároveň landing page — v rozcestníku
      // by jen duplikovala kořen webu.
      .filter((page) => page.slug !== 'home')
      .map(
        (page) =>
          `- [${page.title ?? page.slug}](${SITE_URL}/${page.slug})${describe(page.meta?.description)}`,
      )

    if (pageLinks.length) {
      lines.push('## Stránky', '', ...pageLinks, '')
    }

    /**
     * Jen posledních `RECENT_POSTS` článků.
     *
     * Nefiltrovaný výpis znamenal 301 položek a soubor o 67 kB — kompletní
     * archiv od sezóny 2017/18, kde se klíčová fakta o klubu utopila mezi
     * stovkami zápasových zpráviček. `llms.txt` je rozcestník, ne export
     * databáze; zbytek archivu je objevitelný přes `/aktuality` a
     * `posts-sitemap.xml`.
     */
    const RECENT_POSTS = 30

    const postLinks = posts.docs
      .filter((post) => Boolean(post.slug))
      .slice(0, RECENT_POSTS)
      .map(
        (post) =>
          `- [${post.title ?? post.slug}](${SITE_URL}/aktuality/${post.slug})${describe(
            post.excerpt || post.meta?.description,
          )}`,
      )

    if (postLinks.length) {
      lines.push(
        '## Aktuality',
        '',
        `Posledních ${postLinks.length} článků; celý archiv je na ${SITE_URL}/aktuality.`,
        '',
        ...postLinks,
        '',
      )
    }

    // Detaily fotoalb jsou veřejné stránky, ale dotazy výš je nevrátí —
    // stejná mezera, jakou měla sitemapa (viz `gallery-sitemap.xml`).
    const galleryLinks = galleries.docs
      .filter((gallery) => Boolean(gallery.slug))
      .map(
        (gallery) =>
          `- [${gallery.title ?? gallery.slug}](${SITE_URL}/fotogalerie/${gallery.slug})`,
      )

    if (galleryLinks.length) {
      lines.push('## Fotoalba', '', ...galleryLinks, '')
    }

    // Ručně psané Next stránky nejsou dokumenty v CMS, takže je žádný
    // dotaz výš nevrátí — a přitom jsou to nejnavštěvovanější sekce webu.
    lines.push(
      '## Sekce webu',
      '',
      `- [Zápasy](${SITE_URL}/zapasy): rozpis a výsledky zápasů aktuální sezóny.`,
      `- [Soupiska](${SITE_URL}/soupiska): hráči a realizační tým.`,
      `- [Aktuality](${SITE_URL}/aktuality): výpis všech článků.`,
      `- [Fotogalerie](${SITE_URL}/fotogalerie): fotky ze zápasů a akcí klubu.`,
      `- [Historie klubu](${SITE_URL}/historie-klubu): milníky a lidé klubu.`,
      `- [Sponzoři](${SITE_URL}/sponzori): partneři klubu.`,
      '',
    )

    return lines.join('\n')
  },
  ['llms-txt'],
  {
    tags: ['llms-txt'],
  },
)

export async function GET() {
  const body = await getLlmsTxt()

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
