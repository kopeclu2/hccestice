import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { PageHeader } from '@/landing/components/PageHeader'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

/**
 * ISR pojistka. Tahle routa byla jediná prerenderovaná bez ní — čistě
 * statická, invalidovaná jen hookem `revalidatePage`. Když hook
 * neproběhne (import s `context.disableRevalidate`, výjimka při zápisu,
 * změna v přidruženém médiu), stránka zůstala stará **až do dalšího
 * deploye**. Ostatní landing routy mají 600 s, takže tu asymetrii nešlo
 * odlišit od záměru.
 */
export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)

  // Domovská stránka se renderuje landing routou `(landing)/page.tsx`.
  // `permanentRedirect` (308), ne `redirect` (307 Temporary) — `/home`
  // nikdy nebude vlastní stránka.
  if (decodedSlug === 'home') {
    permanentRedirect('/')
  }

  const url = '/' + decodedSlug

  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    slug: decodedSlug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  /**
   * Všech sedm dokumentů v `pages` má `hero.type = 'none'`, takže
   * `RenderHero` vrátí `null` a `page.title` se nevykreslil nikdy —
   * `/kontakty`, `/nabor` i `/reklamni-predmety` byly bez `<h1>` a bez
   * drobečků. Titulek v CMS přitom vyplněný je; chyběla jen hlavička,
   * která ho zobrazí. `PageHeader` je tatáž komponenta, jakou používá
   * sedm ručně psaných podstránek, takže se vzhled ani drobečková
   * strukturovaná data nemohou rozejít.
   *
   * Nestačí ale typ: hero bez obsahu se taky nevykreslí (`LowImpactHero`
   * vrací `null` pro prázdný `richText`, viz `heros/LowImpact/index.tsx`),
   * takže `/produkty-merch` s herem `lowImpact` a prázdným textem zůstalo
   * bez hlavičky úplně stejně. Podmínka proto hlídá i obsah — jinak
   * mřížka produktů začínala hned pod navigací a bez `<h1>`.
   */
  const hasHero = Boolean(
    hero?.type && hero.type !== 'none' && (hero.richText || hero.media || hero.links?.length),
  )

  return (
    <SubpageShell>
      {/* Redirecty se uplatní i na existující stránky (změna slugu v CMS). */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {hasHero ? (
        <RenderHero {...hero} />
      ) : (
        <PageHeader title={page.title} trail={[{ label: page.title }]} />
      )}
      <RenderBlocks blocks={layout} />
    </SubpageShell>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
