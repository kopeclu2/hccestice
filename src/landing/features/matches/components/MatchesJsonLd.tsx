import React from 'react'

import type { FixtureCard, ResultRow } from '@/landing/features/matches/types'
import {
  eventDescription,
  toMatchesJsonLd,
  type SportsEventInput,
} from '@/landing/features/matches/view/matchSchema'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { OG_FALLBACK_IMAGE } from '@/lib/mergeOpenGraph'

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
  // Výpis fotky reportáží nenese, takže všechny události dostanou logo klubu.
  const image = `${base}${OG_FALLBACK_IMAGE}`
  const urlOf = (href: string | null) => `${base}${href ?? '/zapasy'}`

  const events: SportsEventInput[] = [
    ...fixtures.map((fixture) => ({
      ...fixture,
      status: 'scheduled' as const,
      description: eventDescription(fixture.stage, null, fixture.homeName, fixture.awayName),
      url: urlOf(fixture.href),
      image,
    })),
    ...results.map((row) => ({
      ...row,
      status: 'played' as const,
      description: eventDescription(row.stage, row.score, row.homeName, row.awayName),
      url: urlOf(row.href),
      image,
    })),
  ]

  if (!events.length) return null

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(toMatchesJsonLd(events, base)),
      }}
      type="application/ld+json"
    />
  )
}
