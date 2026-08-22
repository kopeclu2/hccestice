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
        disallow: ['/admin', '/admin/*'],
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/gallery-sitemap.xml`,
    ],
  },
}
