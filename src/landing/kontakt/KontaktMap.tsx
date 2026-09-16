import React from 'react'

import { MapPanel } from '../components/MapPanel'
import { CONTACT_MAP } from '../content'

/**
 * Mapa zimního stadionu na `/kontakt`.
 *
 * Stránka dřív nesla jen adresu spolku v Česticích, kde klub led nemá —
 * návštěvník neměl jak zjistit, kam na domácí zápas jet. Vlastní CMS blok
 * `mapEmbed` tu použít nejde (stránka není dokument v Payloadu), proto
 * sdílený `MapPanel` s obsahem z `content.ts`.
 */
export function KontaktMap() {
  const query = encodeURIComponent(CONTACT_MAP.query)

  return (
    <MapPanel
      directionsHref={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
      embedUrl={`https://maps.google.com/maps?q=${query}&output=embed`}
      mapLabel={`Mapa — ${CONTACT_MAP.venue}, ${CONTACT_MAP.address}`}
      pills={CONTACT_MAP.pills}
      spacing="section"
      title={CONTACT_MAP.title}
    />
  )
}
