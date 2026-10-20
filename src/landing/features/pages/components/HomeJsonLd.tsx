import React from 'react'

import type { SiteLinks } from '@/landing/types'
import { CLUB_LOGO, CLUB_NAME } from '@/lib/club'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { arenaNode } from '@/lib/schemaOrg'

/**
 * JSON-LD (schema.org SportsTeam + WebSite) pro vyhledávače.
 *
 * `sameAs` jde ze `siteConfig` (ne natvrdo), aby změna profilu na sítích
 * byla otázkou administrace. `address` nese plnou poštovní adresu spolku —
 * dřív tu byla jen obec a PSČ, což byla navíc nekonzistentní kombinace
 * (`Čestice` + `517 41`, ale to PSČ patří Kostelci nad Orlicí).
 *
 * `WebSite` je bez `potentialAction`/`SearchAction` **záměrně**: web
 * nemá veřejné vyhledávací pole (kolekce `search` je interní index pro
 * `/llms.txt`), takže by šlo o nepravdivá strukturovaná data.
 */
export function HomeJsonLd({ site }: { site: SiteLinks }) {
  const baseUrl = getServerSideURL()

  const team = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: CLUB_NAME,
    alternateName: 'TJ Sokol Čestice',
    sport: 'Ice Hockey',
    // Rok založení oddílu ledního hokeje při TJ Sokol — první milník
    // timeline na `/historie-klubu`. Sedmdesát let existence je pro klub
    // téhle velikosti nejsilnější signál důvěryhodnosti, jaký má.
    foundingDate: '1954',
    url: baseUrl,
    logo: `${baseUrl}${CLUB_LOGO}`,
    email: site.email,
    ...(([site.facebook, site.instagram].filter(Boolean) as string[]).length
      ? { sameAs: [site.facebook, site.instagram].filter(Boolean) }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Čestice 112',
      addressLocality: 'Kostelec nad Orlicí',
      addressRegion: 'Královéhradecký kraj',
      postalCode: '517 41',
      addressCountry: 'CZ',
    },
    // Jediná definice haly (`@id`) — na ni se odkazují i zápasy.
    location: arenaNode(baseUrl),
    // Spádová oblast pro nábor. Sídlo spolku je v Česticích, ale hraje se
    // v Rychnově — bez `areaServed` nemá vyhledávač jak poznat, že klub
    // obsluhuje celý okres a ne jen obec z poštovní adresy.
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'okres Rychnov nad Kněžnou',
    },
    memberOf: {
      '@type': 'SportsOrganization',
      name: 'Východočeská hokejová liga',
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: CLUB_NAME,
    url: baseUrl,
    inLanguage: 'cs-CZ',
    publisher: { '@type': 'SportsTeam', name: CLUB_NAME },
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(team) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }}
        type="application/ld+json"
      />
    </>
  )
}
