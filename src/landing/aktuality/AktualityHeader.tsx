import React from 'react'

import { Highlight } from '../components/Kicker'
import { PageHeader } from '../components/PageHeader'
import { countLabel } from '../data/format'

import { TypeFilters } from './TypeFilters'

/**
 * Hlavička výpisu aktualit: drobečky, titulek s lime zvýrazněním, perex,
 * filtr typů a počet článků. `id="seznam"` je scroll kotva stránkování.
 */
export function AktualityHeader({
  activeType,
  totalDocs,
}: {
  activeType: string | null
  totalDocs: number
}) {
  return (
    <PageHeader
      className="scroll-mt-5"
      filters={<TypeFilters activeType={activeType} />}
      id="seznam"
      meta={countLabel(totalDocs, ['článek', 'články', 'článků'])}
      perex="Zápasové reporty, dění v klubu a mládež. Všechno, co se za sezónu semele na zimáku i mimo něj."
      title={
        <>
          Co se v klubu <Highlight>děje</Highlight>
        </>
      }
      trail={[{ label: 'Aktuality' }]}
      watermark="NEWS"
    />
  )
}
