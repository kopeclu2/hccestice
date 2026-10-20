import type { ArticleDetail } from '@/landing/features/posts/types'
import type { Crumb } from '@/landing/layout/BreadcrumbsJsonLd'
import { routes } from '@/lib/routes'

/**
 * Drobečky hero článku: Aktuality / kategorie („Zápasy", „Novinky"…).
 * Viditelný poslední drobek je kategorie, ale v JSON-LD `BreadcrumbList`
 * končí titulkem článku — Google tak vidí, kam se klikne, ne obecný štítek.
 */
export const articleTrail = ({ badge, title }: Pick<ArticleDetail, 'badge' | 'title'>): Crumb[] => [
  { href: routes.list.posts, label: 'Aktuality' },
  { label: badge, schemaName: title },
]
