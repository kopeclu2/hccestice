import React from 'react'

import type { SiteLinks } from '@/landing/types'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { toHomeGraph } from '@/lib/schemaOrg'

/**
 * JSON-LD domovské stránky: jeden `@graph` s týmem (`#team`), halou
 * (`#arena`) a webem (`#website`). Uzly skládá `lib/schemaOrg`, aby na ně
 * zápasy a články odkazovaly stejnými `@id`.
 */
export function HomeJsonLd({ site }: { site: SiteLinks }) {
  const jsonLd = toHomeGraph({
    baseUrl: getServerSideURL(),
    email: site.email,
    sameAs: [site.facebook, site.instagram],
  })

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
