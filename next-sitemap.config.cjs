const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

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
