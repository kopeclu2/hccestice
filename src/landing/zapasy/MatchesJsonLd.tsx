import React from 'react'

import { getServerSideURL } from '@/utilities/getURL'
import { serializeJsonLd } from '@/utilities/jsonLd'

import { eventDescription, toSportsEvent } from '../data/matchSchema'
import type { FixtureCard, ResultRow } from '../types'

/**
 * JSON-LD (schema.org `SportsEvent`) pro rozlosování i odehrané zápasy.
 *
 * `/zapasy` dřív nesla jen `BreadcrumbList` — samotné zápasy, tedy jediný
 * obsah, kvůli kterému na stránku někdo chodí, nebyly strukturovaně
 * popsané vůbec.
 *
 * Vstupem jsou **vykreslené** karty a řádky, ne vlastní dotaz do databáze.
 * Výpis výsledků je stránkovaný po šesti, takže dotaz na celou sezónu by
 * inzeroval zápasy, které na stránce nejsou — strukturovaná data mají
 * popisovat to, co návštěvník vidí.
 */

export function MatchesJsonLd({
  fixtures,
  results,
}: {
  fixtures: FixtureCard[]
  results: ResultRow[]
}) {
  const base = getServerSideURL()
  // Zápas bez slugu detail nemá — event ukazuje na výpis, kde je k vidění.
  const urlOf = (href: string | null) => `${base}${href ?? '/zapasy'}`

  const events = [
    ...fixtures.map((fixture) =>
      toSportsEvent({
        ...fixture,
        status: 'scheduled',
        description: eventDescription(fixture.stage, null, fixture.homeName, fixture.awayName),
        url: urlOf(fixture.href),
      }),
    ),
    ...results.map((row) =>
      toSportsEvent({
        ...row,
        status: 'played',
        description: eventDescription(row.stage, row.score, row.homeName, row.awayName),
        url: urlOf(row.href),
      }),
    ),
  ]

  if (!events.length) return null

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({ '@context': 'https://schema.org', '@graph': events }),
      }}
      type="application/ld+json"
    />
  )
}
