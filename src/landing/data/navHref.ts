import type { NavItem } from '../types'

/**
 * Čisté resolvery cílů navigace — bez jakékoli závislosti na Payloadu.
 *
 * Musí být oddělené od `navigation.ts`: ten sahá na `getPayload`, takže
 * kdyby si klientské komponenty (`NavPills`, `NavMobile`) tahaly resolvery
 * odtud, přišel by do klientského bundlu celý server-only Payload config.
 */

/**
 * Cíl odkazu podle kontextu renderu. Nahrazuje dřívější `SUBPAGE_HREF`
 * a `PAGE_ONLY_LINKS` — obě množiny jsou z `NavItem` derivovatelné.
 *
 * - `home` — kotva na sekci; když sekce na home není, vede na podstránku
 * - `subpage` — podstránka; když žádnou nemá, vede na kotvu homepage
 */
export const navHref = (item: NavItem, context: 'home' | 'subpage'): string => {
  if (context === 'home') return item.anchor ? `#${item.anchor}` : (item.path ?? '/')
  return item.path ?? `/#${item.anchor ?? ''}`
}

/**
 * Stojí návštěvník na stránce této položky? Prefix matching, aby detail
 * (`/aktuality/[slug]`) zvýraznil „Aktuality"; položky bez podstránky
 * (`path === null`) aktivní nejsou nikdy — kotvu na homepage z cesty
 * poznat nelze.
 *
 * Sdílí ji `NavPills` i `NavMobile`. Než byl predikát tady, žil jen
 * v pilulkách — a ty jsou `hidden xl:flex`, takže na celém intervalu do
 * 1280px nebylo v navigaci vidět, na které stránce uživatel je.
 */
export const isNavItemActive = (item: NavItem, pathname: string): boolean =>
  item.path !== null && (pathname === item.path || pathname.startsWith(`${item.path}/`))

/** Kotva CTA musí být na podstránkách absolutní (`#kontakt` → `/#kontakt`). */
export const ctaHref = (href: string, context: 'home' | 'subpage'): string =>
  context === 'subpage' && href.startsWith('#') ? `/${href}` : href
