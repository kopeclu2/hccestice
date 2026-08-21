import React from 'react'

import { Eyebrow, Highlight } from '../components/Kicker'
import { PageHeader } from '../components/PageHeader'
import { PillLink } from '../components/PillLink'
import { SeasonFilters, type SeasonPill } from '../components/SeasonFilters'

/**
 * Hlavička stránky zápasů: drobečky, titulek s lime zvýrazněním, perex,
 * watermark „VČHL", filtr sezón (stav v URL) a odkaz na oficiální tabulky.
 */
export function ZapasyHeader({
  seasons,
  activeSlug,
  fullTableUrl,
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
  fullTableUrl: string | null
}) {
  return (
    <PageHeader
      filters={
        <>
          {seasons.length > 0 && <Eyebrow className="mr-1.5">Sezóna</Eyebrow>}
          <SeasonFilters activeSlug={activeSlug} basePath="/zapasy" seasons={seasons} />
        </>
      }
      meta={
        fullTableUrl && (
          <PillLink
            href={fullTableUrl}
            rel="noreferrer"
            size="sm"
            target="_blank"
            variant="outline"
          >
            Oficiální tabulky VČHL ↗
          </PillLink>
        )
      }
      metaClassName="hidden md:flex"
      perex="Rozlosování, výsledky a průběžná tabulka Východočeské hokejové ligy. Domácí zápasy hrajeme na zimním stadionu v Rychnově nad Kněžnou."
      title={
        <>
          Zápasy <Highlight>a tabulka</Highlight>
        </>
      }
      trail={[{ label: 'Zápasy' }]}
      watermark="VČHL"
    />
  )
}
