import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderLandingBlocks } from '@/landing/blocks/render'
import { fetchSite, fetchSiteConfig, mapFooter } from '@/landing/data/site'
import { HomeJsonLd } from '@/landing/features/pages/components/HomeJsonLd'
import { fetchPageBySlug } from '@/landing/features/pages/data'
import { LandingFooter } from '@/landing/layout/LandingFooter'
import { PageCanvas } from '@/landing/ui/PageCanvas'
import { CLUB_NAME } from '@/lib/club'
import { generateMeta } from '@/lib/generateMeta'

/**
 * ISR pojistka — obsah se reviduje i bez zásahu v adminu. Změny home
 * stránky revalidují okamžitě (hook `revalidatePage` kolekce Pages),
 * lidé a patička přes `revalidateLanding`.
 */
export const revalidate = 600

/**
 * Landing page HC Čestice — dokument `pages` se slugem „home".
 *
 * Sekce jsou bloky layout builderu (viz `src/landing/blocks/`),
 * editor je v adminu skládá/přeskládává; render zajišťuje
 * `RenderLandingBlocks`. Pevný rám stránky (gradient pozadí, šrafování,
 * patička ze `siteConfig`, JSON-LD) drží tato komponenta.
 *
 * Podporuje draft mode + live preview (vzor `(frontend)/[slug]/page.tsx`).
 */
export default async function LandingPage() {
  const { isEnabled: draft } = await draftMode()
  const [page, siteConfig, site] = await Promise.all([
    fetchPageBySlug('home'),
    fetchSiteConfig(),
    fetchSite(),
  ])

  return (
    /* Homepage nepoužívá `SubpageShell`: navigace jí přichází z bloku Hero,
       ne z `ArticleNav` (viz „Známé mezery" v AGENTS.md). */
    <PageCanvas surface="home">
      {draft && <LivePreviewListener />}

      {page ? (
        <RenderLandingBlocks blocks={page.layout ?? []} />
      ) : (
        <p className="py-40 text-center">
          Stránka „home“ v CMS chybí — spusťte{' '}
          <code>bun --env-file=.env scripts/seed/seed-home-landing.ts</code>.
        </p>
      )}

      <LandingFooter content={mapFooter(siteConfig)} site={site} />

      <HomeJsonLd site={site} />
    </PageCanvas>
  )
}

const FALLBACK_META: Metadata = {
  title: `${CLUB_NAME} — hokejový klub | TJ Sokol Čestice`,
  description:
    'Hokejový klub HC Čestice (TJ Sokol Čestice) hraje Východočeskou hokejovou ligu. Zápasy, výsledky, tréninky, fotoalbum a nábor nových hráčů i mládeže.',
  alternates: { canonical: '/' },
  openGraph: {
    title: `${CLUB_NAME} — malý klub, velká sezóna`,
    description:
      'Historické 3. místo v play-off VČHL 2025/26. Přijď na led — trénujeme dvakrát týdně v Rychnově nad Kněžnou.',
    locale: 'cs_CZ',
    type: 'website',
    url: '/',
  },
  // Vlastní, ne dědění z `defaultTwitter` — homepage má jiný (konkrétnější)
  // titulek a popis než generický fallback webu, viz `openGraph` výš.
  twitter: {
    card: 'summary_large_image',
    description:
      'Historické 3. místo v play-off VČHL 2025/26. Přijď na led — trénujeme dvakrát týdně v Rychnově nad Kněžnou.',
    title: `${CLUB_NAME} — malý klub, velká sezóna`,
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPageBySlug('home')
  if (!page?.meta?.title) return FALLBACK_META
  return { ...FALLBACK_META, ...(await generateMeta({ doc: page })) }
}
