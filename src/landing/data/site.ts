import type { Person, SiteConfig } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { CLUB_EMAIL, FOOTER } from '../content'
import type { FooterContent, PersonCard, SiteLinks } from '../types'

import { stripTracking } from '@/utilities/stripTracking'

import { arrayOr, toPersonCard, uploadToPhoto } from './format'

/** Global `siteConfig` (kontakty, sítě, patička) + kolekce Lidé. */

export const fetchSiteConfig = cache(async (): Promise<SiteConfig> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'siteConfig', depth: 1 })
})

/**
 * Kontakty a sociální sítě (odvozeno ze `siteConfig`).
 *
 * Odkazy na sítě jdou přes `stripTracking` — hodnoty v CMS jsou volný text
 * a zkopírovaná URL běžně nese `?fbclid=…`, které by se pak renderovalo na
 * každé stránce webu i ve `sameAs` v JSON-LD.
 */
export async function fetchSite(): Promise<SiteLinks> {
  const site = await fetchSiteConfig()
  return {
    email: site.contactEmail ?? CLUB_EMAIL,
    facebook: stripTracking(site.facebook),
    instagram: stripTracking(site.instagram),
  }
}

/** Patička je pevná část stránky — data žijí v `siteConfig.footer`. */
export function mapFooter(site: SiteConfig): FooterContent {
  const footer = site.footer
  return {
    photo: uploadToPhoto(footer?.photo),
    headline: footer?.headline ?? FOOTER.headline,
    perex: footer?.perex ?? FOOTER.perex,
    columns: arrayOr(
      footer?.columns,
      FOOTER.columns.map((column) => ({ title: column.title, links: [...column.links] })),
      (column) => ({
        title: column.title,
        links: (column.links ?? []).map((link) => ({ label: link.label, href: link.href })),
      }),
    ),
    league: footer?.league ?? FOOTER.league,
  }
}

/** Osoba pro kontaktní kartu. */
export const fetchPerson = cache(async (personId: number): Promise<Person | null> => {
  const payload = await getPayload({ config: configPromise })
  return payload.findByID({ collection: 'people', id: personId, depth: 1 })
})

/** Všichni lidé v klubu dle pořadí — realizační tým na /soupiska. */
export const fetchAllPeople = cache(async (): Promise<PersonCard[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ collection: 'people', sort: 'order', limit: 0, depth: 1 })
  return docs.map(toPersonCard).filter((person): person is PersonCard => Boolean(person))
})
