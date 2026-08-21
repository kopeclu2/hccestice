import React from 'react'

import { Highlight } from '../components/Kicker'
import { PageHeader } from '../components/PageHeader'
import { SeasonFilters, type SeasonPill } from '../components/SeasonFilters'
import { countLabel } from '../data/format'

/**
 * Hlavička výpisu fotogalerií: drobečky, titulek s lime zvýrazněním, perex,
 * filtr sezón a počet galerií. `id="seznam"` je scroll kotva stránkování.
 */
export function GalerieHeader({
  seasons,
  activeSlug,
  totalDocs,
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
  totalDocs: number
}) {
  return (
    <PageHeader
      className="scroll-mt-5"
      filters={
        <SeasonFilters
          activeSlug={activeSlug}
          allLabel="Vše"
          anchor="#seznam"
          basePath="/fotogalerie"
          seasons={seasons}
        />
      }
      /*
       * Dvacet sezón se na 320px zalomí do jedenácti řádků (~570px) a odsune
       * celý výpis pod druhou obrazovku. Pod `md` je z řádku vodorovný pás se
       * snapem (vzor `zapasy/FixturesRail`), přetékající do okrajů sekce;
       * od `md` se vrací původní zalamovaný řádek.
       */
      rowClassName="max-md:no-scrollbar max-md:-mx-[clamp(0.875rem,3vw,2.5rem)] max-md:snap-x max-md:flex-nowrap max-md:overflow-x-auto max-md:px-[clamp(0.875rem,3vw,2.5rem)] max-md:pb-1.5 max-md:[&>*]:flex-none max-md:[&>*]:snap-start"
      id="seznam"
      meta={countLabel(totalDocs, ['galerie', 'galerie', 'galerií'])}
      perex="Galerie ze zápasů, tréninků i akcí mimo led. Fotky přidáváme hned po každém zápase."
      title={
        <>
          Sezóna v <Highlight>obrazech</Highlight>
        </>
      }
      trail={[{ label: 'Fotoalbum' }]}
      watermark="FOTO"
    />
  )
}
