import type { Metadata } from 'next'

import React from 'react'

import { AktualityHeader } from '@/landing/aktuality/AktualityHeader'
import { AktualityGrid } from '@/landing/aktuality/AktualityGrid'
import { SocialCta } from '@/landing/aktuality/SocialCta'
import { Pagination } from '@/landing/components/Pagination'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { POST_TYPE_LABEL, fetchPostsPage } from '@/landing/data/posts'
import { fetchSite, fetchSiteConfig } from '@/landing/data/site'

type Args = { searchParams: Promise<{ page?: string; typ?: string }> }

/** Normalizace URL parametrů — sdílí ji stránka i `generateMetadata`. */
const readParams = (raw: { page?: string; typ?: string }) => ({
  page: Math.max(1, Number.parseInt(raw.page ?? '1', 10) || 1),
  type: raw.typ && raw.typ in POST_TYPE_LABEL ? raw.typ : null,
})

/**
 * Cesta výpisu bez `#seznam` — kotva patří do odkazů stránkování v UI,
 * ne do `canonical`.
 */
const listPath = (page: number, type: string | null): string => {
  const params = new URLSearchParams()
  if (type) params.set('typ', type)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/aktuality${query ? `?${query}` : ''}`
}

/**
 * Výpis aktualit v novém (landing) designu — handoff „HC Cestice Aktuality".
 *
 * Mřížka všech publikovaných článků (textové karty); filtr typu i stránkování
 * žijí v URL (`?typ=report&page=2`), stránka je proto plně dynamická.
 * Neznámý `?typ=` se ignoruje (chová se jako „Vše").
 */
export default async function AktualityPage({ searchParams }: Args) {
  const { page: requestedPage, type } = readParams(await searchParams)

  // Fotky na kartách přepíná správce v Nastavení webu (`postsListShowPhoto`);
  // widget Aktuality na úvodní stránce má vlastní přepínač na svém bloku.
  const showPhoto = (await fetchSiteConfig()).postsListShowPhoto ?? false

  const [postsPage, site] = await Promise.all([
    fetchPostsPage({ page: requestedPage, type, withPhotos: showPhoto }),
    fetchSite(),
  ])

  const hrefFor = (n: number): string => `${listPath(n, type)}#seznam`

  return (
    <SubpageShell>
      <AktualityHeader activeType={type} totalDocs={postsPage.totalDocs} />

      <SectionShell spacing="content">
        <AktualityGrid activeType={type} cards={postsPage.cards} showPhoto={showPhoto} />
        {/* Jedna strana = žádné stránkování. Bez podmínky zůstalo pod výpisem
            (a přímo pod prázdným stavem) mrtvé „Strana 1 z 1" se dvěma
            neaktivními šipkami — `ResultsList` to podmiňuje stejně. */}
        {postsPage.totalPages > 1 && (
          <Pagination hrefFor={hrefFor} page={postsPage.page} totalPages={postsPage.totalPages} />
        )}
      </SectionShell>

      <SocialCta site={site} />
    </SubpageShell>
  )
}

/**
 * Metadata musí být `generateMetadata`, ne statický export — statický
 * objekt nevidí `searchParams`, takže všech 33 stran výpisu inzerovalo
 * `canonical: '/aktuality'`. Google to čte jako „stránka 2 je duplikát
 * stránky 1" a články, na které vede jen ona, nemusí do indexu vůbec.
 *
 * Dvě různá pravidla:
 * - **strana 1** (i s filtrem `?typ=`) je indexovatelná a canonical míří
 *   na holý `/aktuality` — tím se facety konsolidují do jedné URL.
 * - **strana 2+** dostane `noindex, follow`: výpis sám o sobě nemá
 *   vlastní hodnotu, ale crawler po něm musí projít na detaily článků.
 *   Canonical míří sám na sebe; `noindex` v kombinaci s canonicalem na
 *   *jinou* URL jsou protichůdné signály, které Google nedoporučuje.
 */
export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { page, type } = readParams(await searchParams)

  return {
    title: 'Aktuality | HC Čestice',
    description:
      'Zápasové reporty, dění v klubu a mládež. Všechno, co se za sezónu semele na zimáku i mimo něj.',
    alternates: { canonical: page > 1 ? listPath(page, type) : '/aktuality' },
    ...(page > 1 ? { robots: { follow: true, index: false } } : {}),
  }
}
