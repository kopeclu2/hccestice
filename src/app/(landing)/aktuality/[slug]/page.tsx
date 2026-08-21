import type { Metadata } from 'next'

import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { ArticleBody } from '@/landing/article/ArticleBody'
import { ArticleRelated } from '@/landing/article/ArticleRelated'
import { AuthorCard } from '@/landing/article/AuthorCard'
import { TagRow } from '@/landing/article/TagRow'
import { RenderArticleHero } from '@/landing/article/hero/RenderArticleHero'
import {
  fetchDefaultPostPhoto,
  fetchPostBySlug,
  fetchPostSlugs,
  fetchRelatedPostCards,
  toArticleDetail,
} from '@/landing/data/posts'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import type { ArticleDetail } from '@/landing/types'

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
  const slug = decodeURIComponent(rawSlug)
  const { isEnabled: draft } = await draftMode()

  const post = await fetchPostBySlug(slug, draft)
  if (!post) return <PayloadRedirects url={`/aktuality/${slug}`} />

  const article = toArticleDetail(post, await fetchDefaultPostPhoto())
  const related = article.showRelated ? await fetchRelatedPostCards(post) : []

  return (
    <SubpageShell surface="article">
      {draft && <LivePreviewListener />}

      <RenderArticleHero article={article} />

      <ArticleBody post={post} />

      <div className="relative z-1 mx-auto max-w-[51.25rem] px-[clamp(0.875rem,3vw,2.5rem)]">
        <TagRow tags={article.tags} />
        <AuthorCard author={article.author} />
      </div>

      {article.showRelated && <ArticleRelated cards={related} />}

      <StructuredData article={article} slug={slug} />
    </SubpageShell>
  )
}

/** JSON-LD (schema.org NewsArticle) pro vyhledávače. */
function StructuredData({ article, slug }: { article: ArticleDetail; slug: string }) {
  const baseUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(article.photo ? { image: [`${baseUrl}${getMediaUrl(article.photo.url)}`] } : {}),
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'SportsTeam',
      name: 'HC Čestice',
      logo: `${baseUrl}/logo-cestice.png`,
    },
    mainEntityOfPage: `${baseUrl}/aktuality/${slug}`,
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const post = await fetchPostBySlug(slug, false)
  if (!post) return { title: 'Článek nenalezen | HC Čestice' }

  const meta = await generateMeta({ doc: post })
  return {
    ...meta,
    description: meta.description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/aktuality/${slug}` },
  }
}
