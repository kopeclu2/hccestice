import React from 'react'

import type { MatchDetail } from '@/landing/features/matches/types'
import { matchDescription } from '@/landing/features/matches/view/matchDetailView'
import { toSportsEvent } from '@/landing/features/matches/view/matchSchema'
import { matchPath } from '@/landing/lib/paths'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'

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
