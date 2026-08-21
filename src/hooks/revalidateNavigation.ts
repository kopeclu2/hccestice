import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

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
const revalidate = (context: Record<string, unknown>, logger: { info: (m: string) => void }) => {
  if (context.disableRevalidate) return
  logger.info('Revaliduji navigaci (tag navigation)')
  revalidateTag('navigation', 'max')
}

export const revalidateNavigation: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  revalidate(context, payload.logger)
  return doc
}

export const revalidateNavigationDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  revalidate(context, payload.logger)
  return doc
}
