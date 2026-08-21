import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { fetchSite, fetchSiteConfig, mapFooter } from '@/landing/data/site'
import { LandingFooter } from '@/landing/components/LandingFooter'
import { PageCanvas } from '@/landing/components/PageCanvas'
import { RenderLandingBlocks } from '@/landing/render'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'

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
    queryHomePage(),
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
          Stránka „home" v CMS chybí — spusťte{' '}
          <code>bun --env-file=.env migration/seed-home-landing.ts</code>.
        </p>
      )}

      <LandingFooter content={mapFooter(siteConfig)} site={site} />

      <StructuredData email={site.email} />
    </PageCanvas>
  )
}

/** Home dokument z kolekce Pages (draft-aware, cache per request). */
const queryHomePage = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: 'home' } },
    depth: 2,
  })

  return result.docs?.[0] ?? null
})

/** JSON-LD (schema.org SportsTeam) pro vyhledávače. */
function StructuredData({ email }: { email: string }) {
  const baseUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: 'HC Čestice',
    alternateName: 'TJ Sokol Čestice',
    sport: 'Ice Hockey',
    url: baseUrl,
    logo: `${baseUrl}/logo-cestice.png`,
    email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Čestice',
      postalCode: '517 41',
      addressCountry: 'CZ',
    },
    location: {
      '@type': 'Place',
      name: 'Zimní stadion Rychnov nad Kněžnou',
    },
    memberOf: {
      '@type': 'SportsOrganization',
      name: 'Východočeská hokejová liga',
    },
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  )
}

const FALLBACK_META: Metadata = {
  title: 'HC Čestice — hokejový klub | TJ Sokol Čestice',
  description:
    'Hokejový klub HC Čestice (TJ Sokol Čestice) hraje Východočeskou hokejovou ligu. Zápasy, výsledky, tréninky, fotoalbum a nábor nových hráčů i mládeže.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'HC Čestice — malý klub, velká sezóna',
    description:
      'Historické 3. místo v play-off VČHL 2025/26. Přijď na led — trénujeme dvakrát týdně v Rychnově nad Kněžnou.',
    locale: 'cs_CZ',
    type: 'website',
    url: '/',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  if (!page?.meta?.title) return FALLBACK_META
  return { ...FALLBACK_META, ...(await generateMeta({ doc: page })) }
}
