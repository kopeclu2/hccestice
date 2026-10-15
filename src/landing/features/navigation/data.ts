import 'server-only'

import { cache } from 'react'

import { FALLBACK_NAV, HERO } from '@/landing/content'
import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { fetchSiteConfig } from '@/landing/data/site'
import { CACHE_TAGS } from '@/landing/data/tags'
import type { NavCta, NavItem } from '@/landing/features/navigation/types'
import type { NavigationItem } from '@/payload-types'

/** Resolvery cílů jsou v `navHref.ts` (client-safe) — tady jen re-export. */
export { ctaHref, navHref } from './navHref'

/** Kontejner menu v CMS (kolekce `navigation-containers`). */
const CONTAINER_SLUG = 'hlavni'

/**
 * Položka menu z CMS → `NavItem`.
 *
 * Typ `external` znamená v pluginu „cíl zadaný textem" — používáme ho pro
 * ručně psané Next routy, které nejsou dokumenty v `pages`. `internal`
 * skládá cestu ze slugu navázané stránky (nebo z `customPath`).
 */
function toNavItem(doc: NavigationItem): NavItem | null {
  if (doc.active === false || doc.type === 'folder') return null

  const path = (() => {
    if (doc.type === 'external') return doc.url?.trim() || null
    const link = doc.internalLink
    if (link?.customPath?.trim()) return link.customPath.trim()
    const reference = link?.reference
    if (reference && typeof reference === 'object' && 'value' in reference) {
      const page = reference.value
      if (page && typeof page === 'object' && 'slug' in page && page.slug) return `/${page.slug}`
    }
    return null
  })()

  if (!path && !doc.anchor) return null
  return { label: doc.title, anchor: doc.anchor ?? null, path }
}

/**
 * Hlavní navigace z CMS, s fallbackem na `FALLBACK_NAV`.
 *
 * Cachuje se tagem, ne časem: navigace je na každé stránce webu, takže
 * `revalidate = 600` na jednotlivých stránkách by byl nepřijatelně pomalý
 * a `revalidatePath` by musel vyjmenovat i všechny detaily článků. Tag se
 * z `unstable_cache` propaguje i na prerenderované stránky, takže
 * `revalidateTag('navigation')` v hooku pokryje celý web.
 *
 * Pořadí drží relace `container.items` (drizzle ji ukládá s indexem
 * a čte `orderBy asc`), takže se řídí přetahováním v adminu — pole
 * `order` na položkách je proto skryté a nepoužité.
 */
export const fetchNavigation = cachedQuery(
  async (): Promise<NavItem[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'navigation-containers',
      where: { slug: { equals: CONTAINER_SLUG } },
      limit: 1,
      depth: 2,
    })

    const items = docs[0]?.items ?? []
    const mapped = items
      .filter((item): item is NavigationItem => typeof item === 'object' && item !== null)
      .map(toNavItem)
      .filter((item): item is NavItem => item !== null)

    return mapped.length > 0 ? mapped : FALLBACK_NAV
  },
  { key: 'landing-navigation', tags: [CACHE_TAGS.navigation] },
)

/**
 * Tlačítko v navigaci. Blok Hero smí text přebít (`navCtaLabel`), jinak
 * platí globální nastavení a nakonec výchozí text z `content.ts`.
 */
export const fetchNavCta = cache(async (blockLabel?: string | null): Promise<NavCta> => {
  const site = await fetchSiteConfig()
  return {
    label: blockLabel ?? site.navCta?.label ?? HERO.navCta.label,
    href: site.navCta?.href ?? HERO.navCta.href,
  }
})
