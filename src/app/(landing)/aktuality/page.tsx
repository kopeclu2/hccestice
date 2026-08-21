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

/**
 * Výpis aktualit v novém (landing) designu — handoff „HC Cestice Aktuality".
 *
 * Mřížka všech publikovaných článků (textové karty); filtr typu i stránkování
 * žijí v URL (`?typ=report&page=2`), stránka je proto plně dynamická.
 * Neznámý `?typ=` se ignoruje (chová se jako „Vše").
 */
export default async function AktualityPage({ searchParams }: Args) {
  const { page: rawPage, typ } = await searchParams
  const requestedPage = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1)
  const type = typ && typ in POST_TYPE_LABEL ? typ : null

  // Fotky na kartách přepíná správce v Nastavení webu (`postsListShowPhoto`);
  // widget Aktuality na úvodní stránce má vlastní přepínač na svém bloku.
  const showPhoto = (await fetchSiteConfig()).postsListShowPhoto ?? false

  const [postsPage, site] = await Promise.all([
    fetchPostsPage({ page: requestedPage, type, withPhotos: showPhoto }),
    fetchSite(),
  ])

  const hrefFor = (n: number): string => {
    const params = new URLSearchParams()
    if (type) params.set('typ', type)
    if (n > 1) params.set('page', String(n))
    const query = params.toString()
    return `/aktuality${query ? `?${query}` : ''}#seznam`
  }

  return (
    <SubpageShell>
      <AktualityHeader activeType={type} totalDocs={postsPage.totalDocs} />

      <SectionShell spacing="content">
        <AktualityGrid activeType={type} cards={postsPage.cards} showPhoto={showPhoto} />
        <Pagination hrefFor={hrefFor} page={postsPage.page} totalPages={postsPage.totalPages} />
      </SectionShell>

      <SocialCta site={site} />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Aktuality | HC Čestice',
  description:
    'Zápasové reporty, dění v klubu a mládež. Všechno, co se za sezónu semele na zimáku i mimo něj.',
  alternates: { canonical: '/aktuality' },
}
