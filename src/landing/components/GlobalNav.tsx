import { fetchNavCta, fetchNavigation } from '../data/navigation'

import { StickyNav } from './StickyNav'

/**
 * Server hranice pro `StickyNav`: fetche jsou obalené `cache()`
 * (`data/navigation.ts`), takže na stránkách, které navigaci načítají
 * ještě jednou pro `LandingNav`/`ArticleNav`, neproběhne dotaz do
 * databáze dvakrát.
 */
export async function GlobalNav() {
  const [items, cta] = await Promise.all([fetchNavigation(), fetchNavCta()])
  return <StickyNav cta={cta} items={items} />
}
