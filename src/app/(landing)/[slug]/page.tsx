import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/landing/blocks/render'
import { fetchPageBySlug, fetchPageSlugs } from '@/landing/features/pages/data'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { PageHeader } from '@/landing/ui/PageHeader'
import { decodeSlug } from '@/lib/decodeSlug'
import { generateMeta } from '@/lib/generateMeta'

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
  const slugs = await fetchPageSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters; neplatné kódování je 404.
  const decodedSlug = decodeSlug(slug)
  if (decodedSlug === null) notFound()

  // Domovská stránka se renderuje landing routou `(landing)/page.tsx`.
  // `permanentRedirect` (308), ne `redirect` (307 Temporary) — `/home`
  // nikdy nebude vlastní stránka.
  if (decodedSlug === 'home') {
    permanentRedirect('/')
  }

  const url = '/' + decodedSlug

  const page = await fetchPageBySlug(decodedSlug)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { layout } = page

  return (
    <SubpageShell>
      {/* Redirecty se uplatní i na existující stránky (změna slugu v CMS). */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PageHeader title={page.title} trail={[{ label: page.title }]} />
      <RenderBlocks blocks={layout} />
    </SubpageShell>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeSlug(slug)
  if (decodedSlug === null) return {}
  const page = await fetchPageBySlug(decodedSlug)

  return generateMeta({ doc: page })
}
