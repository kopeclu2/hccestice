import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { fetchSiteConfig } from '@/landing/data/site'
import { fetchMatchSlugForPost } from '@/landing/features/matches/data/matchDetail'
import { ArticleBody } from '@/landing/features/posts/components/ArticleBody'
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
import type { ArticleDetail } from '@/landing/features/posts/types'
import { toArticleDetail } from '@/landing/features/posts/view/posts'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { PillLink } from '@/landing/ui/PillLink'
import { generateMeta } from '@/lib/generateMeta'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { routes } from '@/lib/routes'
import type { Post } from '@/payload-types'

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

      <div className="relative z-1 mx-auto max-w-[51.25rem] px-[clamp(0.875rem,3vw,2.5rem)]">
        {/* Hero E (zápasový výsledek) odkaz na detail nese sám, tady by byl dvakrát. */}
        {article.matchHref && article.variant !== 'zapas' && (
          <div className="mt-10">
            <PillLink href={article.matchHref} size="md" variant="outline" withArrow>
              Detail zápasu
            </PillLink>
          </div>
        )}
        <TagRow tags={article.tags} />
        <AuthorCard author={article.author} />
      </div>

      {article.showRelated && <ArticleRelated cards={related} showPhoto={relatedShowPhoto} />}

      <StructuredData article={article} post={post} slug={slug} />
    </SubpageShell>
  )
}

/**
 * JSON-LD (schema.org NewsArticle) pro vyhledávače.
 *
 * `datePublished` je pro Article rich results **povinné** a chybělo tu —
 * proto komponenta bere celý `post`, ne jen zobrazovací `article`.
 * `publisher.logo` musí být `ImageObject`, holé URL Google reportuje
 * jako chybu.
 */
function StructuredData({
  article,
  post,
  slug,
}: {
  article: ArticleDetail
  post: Post
  slug: string
}) {
  const baseUrl = getServerSideURL()
  const publishedAt = post.publishedAt ?? post.createdAt
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(article.photo
      ? { image: [`${baseUrl}${getMediaUrl(article.photo.url, article.photo.updatedAt)}`] }
      : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(post.updatedAt || publishedAt ? { dateModified: post.updatedAt ?? publishedAt } : {}),
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'SportsTeam',
      name: 'HC Čestice',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo-cestice.png` },
    },
    mainEntityOfPage: `${baseUrl}${routes.post(slug)}`,
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const post = await fetchPostBySlug(slug, false)
  if (!post) return { title: 'Článek nenalezen | HC Čestice' }

  const meta = await generateMeta({ collection: 'posts', doc: post })
  return {
    ...meta,
    description: meta.description ?? post.excerpt ?? undefined,
    alternates: { canonical: routes.post(slug) },
  }
}
