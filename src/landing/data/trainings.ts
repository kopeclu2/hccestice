import type { LandingTrainingsBlock } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Rozpis tréninků žije jen jako blok `landingTrainings` v `layout` homepage
 * dokumentu — samostatný global pro něj neexistuje. `/treninky` proto
 * natahuje ten samý homepage dokument a vytáhne z něj blok, aby stránka
 * a homepage sekce vždy zobrazovaly stejná data ze stejného zdroje.
 */
export const fetchTrainingsBlock = cache(async (): Promise<LandingTrainingsBlock | null> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const layout = docs[0]?.layout ?? []
  const block = layout.find(
    (item): item is LandingTrainingsBlock => item.blockType === 'landingTrainings',
  )

  return block ?? null
})
