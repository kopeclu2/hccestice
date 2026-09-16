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
 * Cesta výpisu bez `#seznam` — kotva patří jen do odkazů stránkování v UI,
 * ne do `canonical`. Sdílí ji komponenta (`hrefFor`) i `generateMetadata`.
 */
const listPath = (page: number, seasonSlug: string | null): string => {
  const params = new URLSearchParams()
  if (seasonSlug) params.set('sezona', seasonSlug)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/fotogalerie${query ? `?${query}` : ''}`
}

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

  const hrefFor = (n: number): string => `${listPath(n, activeSlug)}#seznam`

  return (
    <SubpageShell pattern={{ variant: 'glow-duo', tone: 'club', fade: 'top' }}>
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
        {/* Jedna strana = žádné stránkování (viz /aktuality a `ResultsList`). */}
        {galleriesPage.totalPages > 1 && (
          <Pagination
            hrefFor={hrefFor}
            page={galleriesPage.page}
            totalPages={galleriesPage.totalPages}
          />
        )}
      </SectionShell>

      <PhotosCta />
    </SubpageShell>
  )
}

const TITLE = 'Fotoalbum | HC Čestice'
const DESCRIPTION =
  'Galerie ze zápasů, tréninků i akcí mimo led. Fotky přidáváme hned po každém zápase.'

/**
 * Metadata musí být `generateMetadata`, ne statický export — stejný důvod
 * jako u `/aktuality` a `/zapasy`: statický objekt nevidí `searchParams`,
 * takže každá stránka výpisu (`?page=2`, `?page=3`, …) inzerovala stejný
 * `canonical: '/fotogalerie'` a Google to čte jako duplicity.
 *
 * Filtr sezóny (`?sezona=`) se do rozhodnutí o indexaci nepočítá — na první
 * straně se vždy konsoliduje do holého `/fotogalerie`. Jen `page > 1`
 * dostane `noindex, follow`: výpis sám o sobě nemá vlastní hodnotu, ale
 * crawler po něm musí projít na jednotlivé galerie.
 */
export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { page: rawPage, sezona } = await searchParams
  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1)

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: page > 1 ? listPath(page, sezona ?? null) : '/fotogalerie' },
    ...(page > 1 ? { robots: { follow: true, index: false } } : {}),
  }
}
