import 'server-only'

import { cache } from 'react'

import { CLUB_EMAIL, FOOTER } from '@/landing/content'
import { toPersonCard, uploadToPhoto } from '@/landing/lib/media'
import { arrayOr } from '@/landing/lib/payload'
import type { FooterContent, PersonCard, SiteLinks } from '@/landing/types'
import { stripTracking } from '@/lib/stripTracking'
import type { Person, SiteConfig } from '@/payload-types'

import { cachedQuery, getPayloadClient } from './query'
import { CACHE_TAGS } from './tags'

/** Global `siteConfig` (kontakty, sítě, patička) + kolekce Lidé. */

/**
 * `siteConfig` čte **každá** stránka webu: patička přes `SubpageShell`,
 * navigace přes `fetchNavCta`, výpis článků kvůli `postsListShowPhoto`.
 * Na prerenderovaných routách to platí build, na `/aktuality`,
 * `/fotogalerie` a `/zapasy` (plně dynamické kvůli `searchParams`) ale
 * padal `findGlobal` s `depth: 1` na **každý request** — React `cache()`
 * platí jen v rámci jednoho renderu, ne mezi requesty.
 *
 * `revalidate: 3600` je záměrně **navíc** k tagu, ne místo něj. Tag
 * (`revalidateLanding`) invaliduje okamžitě; TTL je záchranná síť pro
 * případ, že hook neproběhne (import přes `disableRevalidate`, výjimka
 * při zápisu). Bez něj je TTL `unstable_cache` **jeden rok**, takže by
 * `export const revalidate = 600` na stránkách nebyl žádná pojistka —
 * regenerace by si vzala tutéž roční cache entry.
 */
export const fetchSiteConfig = cachedQuery(
  async (): Promise<SiteConfig> => {
    const payload = await getPayloadClient()
    return payload.findGlobal({ slug: 'siteConfig', depth: 1 })
  },
  { key: 'site-config', tags: [CACHE_TAGS.siteConfig] },
)

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
  const payload = await getPayloadClient()
  return payload.findByID({ collection: 'people', id: personId, depth: 1, disableErrors: true })
})

/** Všichni lidé v klubu dle pořadí — realizační tým na /soupiska. */
export const fetchAllPeople = cache(async (): Promise<PersonCard[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'people', sort: 'order', limit: 0, depth: 1 })
  return docs.map(toPersonCard).filter((person): person is PersonCard => Boolean(person))
})
