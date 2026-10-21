const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/**
 * `Host:` je nestandardní direktiva (jen Yandex, a ten ji v roce 2018
 * zrušil) — Google ani Bing ji nečtou a validátory ji berou jako neznámý
 * příkaz. `next-sitemap` ji vkládá natvrdo bez možnosti vypnutí (viz
 * `robots-txt-builder.js`), proto se blok `# Host` vyřízne z hotového textu.
 */
const stripHostDirective = (text) => text.replace(/# Host\nHost:[^\n]*\n\n?/, '')

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/posts-sitemap.xml',
    '/pages-sitemap.xml',
    '/gallery-sitemap.xml',
    '/matches-sitemap.xml',
    '/*',
    '/posts/*',
  ],
  robotsTxtOptions: {
    transformRobotsTxt: async (_config, text) => stripHostDirective(text),
    policies: [
      {
        userAgent: '*',
        // Obojí je potřeba: robots.txt matchuje prefixem, takže `/admin/*`
        // nekryje přesnou cestu `/admin` (ta vracela 200 s přihlašovací
        // stránkou; chránil ji jen vlastní `noindex` v HTML).
        // `/api/` je Payload REST a GraphQL (JSON, v indexu nemá co dělat),
        // `/next/` preview a exit-preview.
        disallow: ['/admin', '/admin/*', '/api/', '/next/'],
        // Média ale leží pod `/api/media/file/` a nesou je `og:image`,
        // JSON-LD i `<img>`; delší (konkrétnější) pravidlo `allow` v
        // robots.txt vyhrává nad `disallow: /api/`.
        allow: ['/api/media/file/'],
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/gallery-sitemap.xml`,
      `${SITE_URL}/matches-sitemap.xml`,
    ],
  },
}
