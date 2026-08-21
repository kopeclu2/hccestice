import React from 'react'

import { Highlight } from '../components/Kicker'
import { PageHeader } from '../components/PageHeader'
import { PillLink } from '../components/PillLink'

/**
 * Hlavička stránky partnerů: watermark „DÍKY", drobečky, titulek s lime
 * zvýrazněním, perex se sezónou a CTA „Chci podpořit klub" s počtem partnerů.
 *
 * Počet je na rozdíl od soupisky vidět i na mobilu (handoff ho neskrývá)
 * a sedí hned vedle CTA, ne u pravé hrany — proto `spacer={false}`.
 */
export function SponzoriHeader({
  count,
  seasonLabel,
}: {
  count: string
  seasonLabel: string | null
}) {
  return (
    <PageHeader
      filters={
        <PillLink href="/#kontakt" variant="dark" withArrow>
          Chci podpořit klub
        </PillLink>
      }
      meta={count}
      metaClassName="text-faint text-meta font-semibold"
      perex={
        <>
          Led, rozhodčí, doprava, výstroj — vesnický hokej stojí na lidech a firmách z okolí, které
          ho drží nad vodou. Tohle jsou naši partneři
          {seasonLabel ? ` pro sezónu ${seasonLabel}` : ''}.
        </>
      }
      perexWidth="md"
      rowClassName="mt-7.5 gap-x-2.5 gap-y-3"
      spacer={false}
      title={
        <>
          Bez nich by se <Highlight>nehrálo</Highlight>
        </>
      }
      trail={[{ label: 'Partneři' }]}
      watermark="DÍKY"
    />
  )
}
