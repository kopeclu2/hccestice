import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Navigace je na každé stránce webu, takže se nerevaliduje po cestách
 * (`revalidatePath` jich by musel vyjmenovat i všechny detaily článků
 * a galerií), ale tagem. Tag se z `unstable_cache` propaguje i na
 * build-time prerenderované stránky, takže jedno zavolání pokryje vše.
 *
 * Musí být na `afterChange` i `afterDelete` obou nav kolekcí — bez
 * `afterDelete` by smazaná položka zůstala v menu (cache navigace má bez
 * revalidace TTL jeden rok).
 */
const hooks = createRevalidateHooks({
  label: 'navigaci',
  tags: [CACHE_TAGS.navigation],
  profile: { expire: 0 },
})

export const revalidateNavigation = hooks.afterChange
export const revalidateNavigationDelete = hooks.afterDelete
