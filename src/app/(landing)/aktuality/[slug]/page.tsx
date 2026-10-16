import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Button } from '@/components/ui/button'
import { fetchSiteConfig } from '@/landing/data/site'
import { fetchMatchSlugForPost } from '@/landing/features/matches/data/matchDetail'
import { ArticleBody } from '@/landing/features/posts/components/ArticleBody'
import { ArticleJsonLd } from '@/landing/features/posts/components/ArticleJsonLd'
import { ArticleRelated } from '@/landing/features/posts/components/ArticleRelated'
import { AuthorCard } from '@/landing/features/posts/components/AuthorCard'
import { RenderArticleHero } from '@/landing/features/posts/components/hero/RenderArticleHero'
import { TagRow } from '@/landing/features/posts/components/TagRow'
import {
  fetchDefaultPostPhoto,
  fetchPostBySlug,
  fetchPostSlugs,
  fetchRelatedPostCards,
} from '@/landing/features/posts/data/posts'
import { toArticleDetail } from '@/landing/features/posts/view/posts'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { brandTitle } from '@/lib/brandTitle'
import { decodeSlug } from '@/lib/decodeSlug'
import { generateMeta } from '@/lib/generateMeta'
import { routes } from '@/lib/routes'

/** ISR pojistka; publikace revaliduje okamžitě (hook `revalidatePost`). */
export const revalidate = 600

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

/**
 * Detail článku v novém (landing) designu — handoff „HC Cestice Clanek".
 *
 * Hero má 5 variant volených polem `heroVariant` v adminu
 * (render: `RenderArticleHero`, fallbacky: `toArticleDetail`).
 * Podporuje draft mode + live preview; neexistující slug řeší
 * `PayloadRedirects` (legacy redirecty z eStránek).
 */
export default async function ArticlePage({ params }: Args) {
  const { slug: rawSlug } = await params
  const slug = decodeSlug(rawSlug)
  // Neplatné procentové kódování (`%zz`) je 404, ne 500.
  if (slug === null) notFound()
  const { isEnabled: draft } = await draftMode()

  const post = await fetchPostBySlug(slug, draft)
  if (!post) return <PayloadRedirects url={routes.post(slug)} />

  const article = toArticleDetail(
    post,
    await fetchDefaultPostPhoto(),
    await fetchMatchSlugForPost(post),
  )
  const related = article.showRelated ? await fetchRelatedPostCards(post) : []
  // Karty doporučených článků jsou tytéž jako na výpisu, takže i fotky na nich
  // řídí týž přepínač v Nastavení webu (`postsListShowPhoto`).
  const relatedShowPhoto = related.length
    ? ((await fetchSiteConfig()).postsListShowPhoto ?? false)
    : false

  return (
    <SubpageShell surface="article">
      {draft && <LivePreviewListener />}

      <RenderArticleHero article={article} />

      <ArticleBody post={post} />

      <div className="relative z-1 mx-auto max-w-article px-gutter">
        {/* Hero E (zápasový výsledek) odkaz na detail nese sám, tady by byl dvakrát. */}
        {article.matchHref && article.variant !== 'zapas' && (
          <div className="mt-10">
            <Button asChild size="md" variant="outline" withArrow>
              <Link href={article.matchHref}>Detail zápasu</Link>
            </Button>
          </div>
        )}
        <TagRow tags={article.tags} />
        <AuthorCard author={article.author} />
      </div>

      {article.showRelated && <ArticleRelated cards={related} showPhoto={relatedShowPhoto} />}

      <ArticleJsonLd article={article} post={post} slug={slug} />
    </SubpageShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeSlug(rawSlug)
  if (slug === null) return { title: brandTitle('Článek nenalezen') }
  const post = await fetchPostBySlug(slug, false)
  if (!post) return { title: brandTitle('Článek nenalezen') }

  const meta = await generateMeta({ collection: 'posts', doc: post })
  return {
    ...meta,
    description: meta.description ?? post.excerpt ?? undefined,
    alternates: { canonical: routes.post(slug) },
  }
}
