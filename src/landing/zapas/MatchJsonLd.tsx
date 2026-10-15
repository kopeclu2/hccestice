import React from 'react'

import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'

import { matchPath } from '../data/format'
import { matchDescription } from '../data/matchDetailView'
import { toSportsEvent } from '../data/matchSchema'
import type { MatchDetail } from '../types'

/**
 * JSON-LD `SportsEvent` jednoho zápasu s `url` samotného detailu.
 * Stavba eventu je sdílená s výpisem `/zapasy` (`data/matchSchema.ts`).
 */
export function MatchJsonLd({ match }: { match: MatchDetail }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...toSportsEvent({
      title: match.title,
      startDate: match.kickoffISO,
      homeName: match.homeName,
      awayName: match.awayName,
      venue: match.venue,
      status: match.status,
      description: matchDescription(match),
      url: `${getServerSideURL()}${matchPath(match.slug)}`,
    }),
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
