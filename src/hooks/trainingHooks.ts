import type { CollectionBeforeValidateHook } from 'payload'

import { seasonStartYear, trainingTitle } from '@/lib/trainings'

/**
 * `beforeValidate` kolekce `trainings`: dopočítá `title` (titulek v adminu)
 * a při založení bez ruční volby i `season`.
 *
 * - `title` je odvozený z data a skupiny, takže se vždy přepíše; admin ho
 *   nevidí (`hidden`). Update jen s částí polí bere chybějící hodnoty
 *   z uloženého dokumentu.
 * - Sezóna: ta, do jejíhož rozsahu datum spadá (`seasonStartYear`), jinak
 *   aktuální (`isCurrent`), jinak nic. Dotaz jde přes `req`, aby sdílel
 *   transakci. Při updatu se sezóna nepřepisuje — ruční změna zůstane.
 */
export const fillTraining: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (!data) return data

  const date = data.date ?? originalDoc?.date
  const group = data.group !== undefined ? data.group : originalDoc?.group
  data.title = trainingTitle(date, group)

  if (operation === 'create' && data.season == null && date) {
    const startYear = seasonStartYear(date)
    const byYear =
      startYear == null
        ? null
        : await req.payload.find({
            collection: 'seasons',
            where: { startYear: { equals: startYear } },
            limit: 1,
            depth: 0,
            select: {},
            pagination: false,
            req,
          })
    let season = byYear?.docs[0]
    if (!season) {
      const current = await req.payload.find({
        collection: 'seasons',
        where: { isCurrent: { equals: true } },
        limit: 1,
        depth: 0,
        select: {},
        pagination: false,
        req,
      })
      season = current.docs[0]
    }
    if (season) data.season = season.id
  }

  return data
}
