import 'server-only'

import { cache } from 'react'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import { toTrainingSession } from '@/landing/features/trainings/view/trainingSession'
import type { TrainingSession } from '@/landing/features/trainings/view/trainingsTable'
import { startOfPragueDayIso } from '@/lib/trainings'
import type { LandingTrainingsBlock } from '@/payload-types'

/**
 * Rozpis tréninků žije jen jako blok `landingTrainings` v `layout` homepage
 * dokumentu — samostatný global pro něj neexistuje. `/treninky` proto
 * natahuje ten samý homepage dokument a vytáhne z něj blok, aby stránka
 * a homepage sekce vždy zobrazovaly stejná data ze stejného zdroje.
 */
export const fetchTrainingsBlock = cache(async (): Promise<LandingTrainingsBlock | null> => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    pagination: false,
    depth: 0,
    // Local API má `overrideAccess` výchozí `true` — bez toho by se po
    // odpublikování homepage rozpis dál četl z konceptu.
    overrideAccess: false,
  })

  const layout = docs[0]?.layout ?? []
  const block = layout.find(
    (item): item is LandingTrainingsBlock => item.blockType === 'landingTrainings',
  )

  return block ?? null
})

/** Kolik budoucích termínů web načítá — rozpis na ~2 měsíce dopředu s rezervou. */
const SESSIONS_LIMIT = 60

const queryTrainingSessions = cachedQuery(
  async (from: string): Promise<TrainingSession[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'trainings',
      where: {
        and: [{ date: { greater_than_equal: from } }, { hiddenOnWeb: { not_equals: true } }],
      },
      sort: 'date',
      limit: SESSIONS_LIMIT,
      depth: 0,
      select: { date: true, endsAt: true, group: true, venue: true, note: true, joint: true },
      overrideAccess: false,
    })
    return docs.map(toTrainingSession)
  },
  { key: 'trainings', version: 'v1', tags: [CACHE_TAGS.trainings], revalidate: 3600 },
)

/**
 * Nadcházející termíny tréninků (od začátku dneška v Europe/Prague).
 *
 * Hranice „od teď" se počítá **tady, mimo cache**, a vstupuje do klíče
 * argumentem: `new Date()` uvnitř `unstable_cache` by zamrzlo na celou dobu
 * entry a odehraný trénink by zůstal v rozpisu (viz `scheduleFrom()` v
 * `matches.ts`). Den, ne hodina — dnešní trénink zůstává vidět celý den.
 */
export const fetchTrainingSessions = (): Promise<TrainingSession[]> =>
  queryTrainingSessions(startOfPragueDayIso(new Date()))
