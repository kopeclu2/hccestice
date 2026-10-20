import React from 'react'

import type { MatchDetail } from '@/landing/features/matches/types'
import { matchDescription } from '@/landing/features/matches/view/matchDetailView'
import { toMatchJsonLd } from '@/landing/features/matches/view/matchSchema'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { OG_FALLBACK_IMAGE } from '@/lib/mergeOpenGraph'
import { linkOrNull, routes } from '@/lib/routes'

/**
 * JSON-LD `SportsEvent` jednoho zápasu s `url` samotného detailu.
 * Stavba eventu je sdílená s výpisem `/zapasy` (`view/matchSchema.ts`).
 */
export function MatchJsonLd({ match }: { match: MatchDetail }) {
  const baseUrl = getServerSideURL()
  // Stejný obrázek jako `og:image` (`generateMetadata`): fotka reportáže,
  // bez ní logo klubu.
  const photo = match.report?.photo
  const image = `${baseUrl}${photo ? getMediaUrl(photo.url, photo.updatedAt) : OG_FALLBACK_IMAGE}`

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
