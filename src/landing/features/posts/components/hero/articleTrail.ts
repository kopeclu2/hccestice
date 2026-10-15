import type { Crumb } from '@/landing/layout/BreadcrumbsJsonLd'
import { routes } from '@/lib/routes'

/** Drobečky hero článku: Aktuality / kategorie („Zápasy", „Novinky"…). */
export const articleTrail = (badge: string): Crumb[] => [
  { href: routes.list.posts, label: 'Aktuality' },
  { label: badge },
]
