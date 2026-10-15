import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'

import { SeasonFilters, type SeasonPill } from './SeasonFilters'

/**
 * Hlavička stránky zápasů: drobečky, titulek s lime zvýrazněním, perex,
 * watermark „VČHL", filtr sezón (stav v URL) a odkaz na oficiální tabulky.
 */
export function MatchesHeader({
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
          <Button asChild size="sm" variant="outline">
            <Link href={fullTableUrl} rel="noreferrer" target="_blank">
              Oficiální tabulky VČHL ↗
            </Link>
          </Button>
        )
      }
      /* Pod `md` se pilulka zalomí na vlastní řádek pod filtry sezón. Dřív ji
         `hidden md:flex` na mobilu schovávalo celou — jenže je to jediný odkaz
         na oficiální tabulky na celé stránce, takže se na telefonu nedal
         otevřít vůbec. */
      metaClassName="flex max-md:order-2"
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
