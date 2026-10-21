import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { GalleriesHeader } from '@/landing/features/galleries/components/GalleriesHeader'
import { GalleryGrid } from '@/landing/features/galleries/components/GalleryGrid'
import { PhotosCta } from '@/landing/features/galleries/components/PhotosCta'
import { fetchGalleriesPage } from '@/landing/features/galleries/data'
import { fetchGallerySeasons, seasonShortLabel } from '@/landing/features/matches/data/seasons'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { buildListUrl, parsePageParam } from '@/landing/lib/listUrl'
import { Pagination } from '@/landing/ui/Pagination'
import { SectionShell } from '@/landing/ui/SectionShell'
import { buildPageMetadata } from '@/lib/buildPageMetadata'
import { routes } from '@/lib/routes'

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
  const requestedPage = parsePageParam(rawPage)

  const seasons = await fetchGallerySeasons()
  const activeSeason = sezona ? (seasons.find((season) => season.slug === sezona) ?? null) : null
  const activeSlug = activeSeason?.slug ?? null

  const galleriesPage = await fetchGalleriesPage({
    page: requestedPage,
    seasonId: activeSeason?.id ?? null,
  })

  // Strana za poslední stranou výpisu je 404, ne prázdný výpis se statusem 200:
  // strana nad `totalPages` neexistuje (prázdný výpis má `totalPages` 0 nebo
  // 1 — první strana je vždy platná).
  // `notFound()`, ne redirect — viz AGENTS.md „`loading.tsx` nesmí být nad
  // routou, která redirectuje".
  if (requestedPage > Math.max(1, galleriesPage.totalPages)) notFound()

  const hrefFor = (n: number): string =>
    buildListUrl(routes.list.galleries, {
      filters: { sezona: activeSlug },
      page: n,
      hash: 'seznam',
    })

  return (
    <SubpageShell pattern={{ variant: 'glow-duo', tone: 'club', fade: 'top' }}>
      <GalleriesHeader
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

const TITLE = 'Fotoalbum'
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
  const page = parsePageParam(rawPage)

  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path:
      page > 1
        ? buildListUrl(routes.list.galleries, { filters: { sezona }, page })
        : routes.list.galleries,
    robots: page > 1 ? { follow: true, index: false } : undefined,
  })
}
