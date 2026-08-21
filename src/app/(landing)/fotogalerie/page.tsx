import type { Metadata } from 'next'

import React from 'react'

import { Pagination } from '@/landing/components/Pagination'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchGalleriesPage } from '@/landing/data/galleries'
import { fetchGallerySeasons, seasonShortLabel } from '@/landing/data/seasons'
import { GalerieHeader } from '@/landing/fotogalerie/GalerieHeader'
import { GalleryGrid } from '@/landing/fotogalerie/GalleryGrid'
import { PhotosCta } from '@/landing/fotogalerie/PhotosCta'

type Args = { searchParams: Promise<{ page?: string; sezona?: string }> }

/**
 * Výpis fotogalerií v novém (landing) designu — handoff „HC Cestice Galerie".
 *
 * Stejný layoutový systém jako /aktuality; filtr sezóny i stránkování
 * žijí v URL (`?sezona=2025-2026&page=2`), stránka je proto plně
 * dynamická. Neznámá `?sezona=` se ignoruje (chová se jako „Vše").
 */
export default async function FotogaleriePage({ searchParams }: Args) {
  const { page: rawPage, sezona } = await searchParams
  const requestedPage = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1)

  const seasons = await fetchGallerySeasons()
  const activeSeason = sezona ? (seasons.find((season) => season.slug === sezona) ?? null) : null
  const activeSlug = activeSeason?.slug ?? null

  const galleriesPage = await fetchGalleriesPage({
    page: requestedPage,
    seasonId: activeSeason?.id ?? null,
  })

  const hrefFor = (n: number): string => {
    const params = new URLSearchParams()
    if (activeSlug) params.set('sezona', activeSlug)
    if (n > 1) params.set('page', String(n))
    const query = params.toString()
    return `/fotogalerie${query ? `?${query}` : ''}#seznam`
  }

  return (
    <SubpageShell>
<GalerieHeader
        activeSlug={activeSlug}
        seasons={seasons
          .filter((season) => season.slug)
          .map((season) => ({ slug: season.slug!, label: seasonShortLabel(season) }))}
        totalDocs={galleriesPage.totalDocs}
      />

      <SectionShell spacing="content">
        <GalleryGrid
          activeSeasonLabel={activeSeason ? seasonShortLabel(activeSeason) : null}
          cards={galleriesPage.cards}
        />
        <Pagination
          hrefFor={hrefFor}
          page={galleriesPage.page}
          totalPages={galleriesPage.totalPages}
        />
      </SectionShell>

      <PhotosCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Fotoalbum | HC Čestice',
  description:
    'Galerie ze zápasů, tréninků i akcí mimo led. Fotky přidáváme hned po každém zápase.',
  alternates: { canonical: '/fotogalerie' },
}
