import React from 'react'

import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'

import type { SeasonPill } from './SeasonFilters'
import { SeasonSelect } from './SeasonSelect'

/**
 * Hlavička stránky zápasů: drobečky, titulek s lime zvýrazněním, perex,
 * watermark „VČHL" a výběr sezóny (rozbalovací nabídka, stav v URL).
 */
export function MatchesHeader({
  seasons,
  activeSlug,
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
}) {
  return (
    <PageHeader
      /* Nad následujícími sekcemi (`SectionShell` je `z-1`), aby je rozbalená
         nabídka sezón překryla, ne aby pod nimi zmizela. */
      className="z-10"
      filters={
        <>
          {seasons.length > 0 && <Eyebrow className="mr-1.5">Sezóna</Eyebrow>}
          <SeasonSelect activeSlug={activeSlug} basePath="/zapasy" seasons={seasons} />
        </>
      }
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
