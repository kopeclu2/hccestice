import React from 'react'

import { getServerSideURL } from '@/utilities/getURL'

import type { Crumb } from './Breadcrumbs'

/**
 * JSON-LD (schema.org BreadcrumbList) k viditelným drobečkům.
 *
 * Drobečky na webu existují ve dvou vizuálně odlišných variantách
 * (`components/Breadcrumbs` pro podstránky, `article/hero/Breadcrumbs`
 * pro hero článku), ale strukturovaná data jsou pro obě stejná — proto
 * jeden sdílený emitor a ne dvě kopie.
 *
 * „Domů" se doplňuje automaticky, stejně jako ve vizuální komponentě,
 * takže volající předává jen zbytek cesty a obě reprezentace se nemohou
 * rozejít.
 *
 * U poslední položky se `item` **vynechává** záměrně — je to aktuální
 * stránka a Google pro ni URL nečeká. Díky tomu komponenta nepotřebuje
 * znát vlastní adresu a jde použít i tam, kde ji nemá po ruce.
 */
export function BreadcrumbsJsonLd({ trail }: { trail: Crumb[] }) {
  const baseUrl = getServerSideURL()
  const items: Crumb[] = [{ href: '/', label: 'Domů' }, ...trail]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href && index < items.length - 1
        ? { item: `${baseUrl}${crumb.href}` }
        : {}),
    })),
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  )
}
