import { fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'

import { StickyNav } from './StickyNav'

/**
 * Server hranice pro `StickyNav`: fetche jsou obalené `cache()`
 * (`features/navigation/data.ts`), takže na stránkách, které navigaci načítají
 * ještě jednou pro `LandingNav`/`ArticleNav`, neproběhne dotaz do
 * databáze dvakrát.
 */
export async function GlobalNav() {
  const [items, cta] = await Promise.all([fetchNavigation(), fetchNavCta()])
  return <StickyNav cta={cta} items={items} />
}
