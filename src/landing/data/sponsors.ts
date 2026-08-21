import type { Sponsor as SponsorDoc } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Sponsor } from '../types'

import { toPhoto } from './format'

/** Sponzoři — marquee pás, spotlight karta a stránka partnerů. */

/** Aktivní sponzoři pro marquee pás i výpis na /sponzori. */
export const fetchSponsors = cache(async (): Promise<Sponsor[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'sponsors',
    where: { active: { equals: true } },
    sort: 'order',
    limit: 0,
    depth: 1,
  })

  return docs.map((sponsor) => ({
    id: sponsor.id,
    name: sponsor.name,
    url: sponsor.url ?? null,
    logo: typeof sponsor.logo === 'object' && sponsor.logo ? toPhoto(sponsor.logo) : null,
    person: sponsor.person ?? null,
    address: sponsor.address ?? null,
    phone: sponsor.phone ?? null,
    email: sponsor.email ?? null,
  }))
})

/** Sponzor pro spotlight kartu (s logem). */
export const fetchSponsor = cache(async (sponsorId: number): Promise<SponsorDoc | null> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findByID({ collection: 'sponsors', id: sponsorId, depth: 1 })
})
