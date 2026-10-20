import { createRequire } from 'node:module'

import type { IConfig } from 'next-sitemap'
import { describe, expect, it } from 'vitest'

// Konfigurace je CommonJS soubor v kořeni repa, který čte `next-sitemap` v `postbuild`.
const config = createRequire(import.meta.url)('../../next-sitemap.config.cjs') as IConfig

/** Tvar, jaký staví `RobotsTxtBuilder.generateRobotsTxt` (včetně natvrdo vloženého `Host`). */
const GENERATED = `# *
User-agent: *
Allow: /api/media/file/
Disallow: /admin
Disallow: /api/

# Host
Host: https://example.cz

# Sitemaps
Sitemap: https://example.cz/pages-sitemap.xml
Sitemap: https://example.cz/posts-sitemap.xml
`

describe('robots.txt (next-sitemap config)', () => {
  const transform = config.robotsTxtOptions?.transformRobotsTxt

  it('odstraní direktivu Host i s komentářem a zachová zbytek', async () => {
    expect(transform).toBeTypeOf('function')
    const out = await transform!(config, GENERATED)
    expect(out).not.toMatch(/Host/i)
    expect(out).toContain('Disallow: /api/\n\n# Sitemaps\n')
    expect(out).toContain('Sitemap: https://example.cz/pages-sitemap.xml')
    expect(out).toContain('Allow: /api/media/file/')
  })

  it('text bez Host nechá beze změny', async () => {
    const plain = '# *\nUser-agent: *\nAllow: /\n'
    expect(await transform!(config, plain)).toBe(plain)
  })
})
