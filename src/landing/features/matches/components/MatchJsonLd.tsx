import React from 'react'

import type { MatchDetail } from '@/landing/features/matches/types'
import { matchDescription } from '@/landing/features/matches/view/matchDetailView'
import { toMatchJsonLd } from '@/landing/features/matches/view/matchSchema'
import { CLUB_LOGO_LARGE } from '@/lib/club'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { linkOrNull, routes } from '@/lib/routes'

/**
 * JSON-LD `SportsEvent` jednoho zápasu s `url` samotného detailu.
 * Stavba eventu je sdílená s výpisem `/zapasy` (`view/matchSchema.ts`).
 */
export function MatchJsonLd({ match }: { match: MatchDetail }) {
  const baseUrl = getServerSideURL()
  // Fotka reportáže jako `og:image` (`generateMetadata`); bez ní velké logo
  // (200px logo z `og:image` nesplňuje 50 000 px, které Google u Event chce).
  const photo = match.report?.photo
  const image = `${baseUrl}${photo ? getMediaUrl(photo.url, photo.updatedAt) : CLUB_LOGO_LARGE}`

  const jsonLd = toMatchJsonLd(
    {
      title: match.title,
      startDate: match.kickoffISO,
      homeName: match.homeName,
      awayName: match.awayName,
      venue: match.venue,
      status: match.status,
      description: matchDescription(match),
      url: `${baseUrl}${linkOrNull(routes.match, match.slug)}`,
      image,
    },
    baseUrl,
  )

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
