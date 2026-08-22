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

import type { SiteLinks } from '@/landing/types'

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

      <StructuredData site={site} />
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

/**
 * JSON-LD (schema.org SportsTeam + WebSite) pro vyhledávače.
 *
 * `sameAs` jde ze `siteConfig` (ne natvrdo), aby změna profilu na sítích
 * byla otázkou administrace. `address` nese plnou poštovní adresu spolku —
 * dřív tu byla jen obec a PSČ, což byla navíc nekonzistentní kombinace
 * (`Čestice` + `517 41`, ale to PSČ patří Kostelci nad Orlicí).
 *
 * `WebSite` je bez `potentialAction`/`SearchAction` **záměrně**: web
 * nemá veřejné vyhledávací pole (kolekce `search` je interní index pro
 * `/llms.txt`), takže by šlo o nepravdivá strukturovaná data.
 */
function StructuredData({ site }: { site: SiteLinks }) {
  const baseUrl = getServerSideURL()

  const team = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: 'HC Čestice',
    alternateName: 'TJ Sokol Čestice',
    sport: 'Ice Hockey',
    url: baseUrl,
    logo: `${baseUrl}/logo-cestice.png`,
    email: site.email,
    ...(([site.facebook, site.instagram].filter(Boolean) as string[]).length
      ? { sameAs: [site.facebook, site.instagram].filter(Boolean) }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Čestice 112',
      addressLocality: 'Kostelec nad Orlicí',
      addressRegion: 'Královéhradecký kraj',
      postalCode: '517 41',
      addressCountry: 'CZ',
    },
    location: {
      '@type': 'Place',
      name: 'Zimní stadion Rychnov nad Kněžnou',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rychnov nad Kněžnou',
        addressCountry: 'CZ',
      },
    },
    memberOf: {
      '@type': 'SportsOrganization',
      name: 'Východočeská hokejová liga',
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HC Čestice',
    url: baseUrl,
    inLanguage: 'cs-CZ',
    publisher: { '@type': 'SportsTeam', name: 'HC Čestice' },
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(team) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        type="application/ld+json"
      />
    </>
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
