import React from 'react'

import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { toWebPage, type WebPageInput } from '@/lib/schemaOrg'

/**
 * JSON-LD typu stránky (`CollectionPage`, `AboutPage`, `ContactPage`) vedle
 * `BreadcrumbList`, který vykresluje `Breadcrumbs`. Tvar skládá čistá
 * `toWebPage` (`lib/schemaOrg`).
 */
export function PageJsonLd(props: Omit<WebPageInput, 'baseUrl'>) {
  const jsonLd = toWebPage({ ...props, baseUrl: getServerSideURL() })

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
