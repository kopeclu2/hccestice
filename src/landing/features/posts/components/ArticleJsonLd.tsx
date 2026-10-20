import React from 'react'

import type { ArticleDetail } from '@/landing/features/posts/types'
import { articleImages, toNewsArticle } from '@/landing/features/posts/view/articleSchema'
import { CLUB_LOGO } from '@/lib/club'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import type { Post } from '@/payload-types'

/**
 * JSON-LD (schema.org NewsArticle) pro vyhledávače; tvar skládá čistá
 * `toNewsArticle` (`view/articleSchema.ts`).
 *
 * `datePublished` je pro Article rich results **povinné** a chybělo tu —
 * proto komponenta bere celý `post`, ne jen zobrazovací `article`.
 */
export function ArticleJsonLd({
  article,
  post,
  slug,
}: {
  article: ArticleDetail
  post: Post
  slug: string
}) {
  const baseUrl = getServerSideURL()
  const media = typeof post.heroImage === 'object' && post.heroImage ? post.heroImage : null

  const jsonLd = toNewsArticle({
    baseUrl,
    slug,
    headline: article.title,
    description: article.excerpt,
    images: articleImages({
      baseUrl,
      media,
      // Bez fotky v článku je `article.photo` výchozí obrázek z nastavení webu,
      // bez něj logo — stejně jako `og:image` (`generateMeta`).
      fallback: article.photo ?? { url: CLUB_LOGO },
    }),
    publishedAt: post.publishedAt ?? post.createdAt,
    modifiedAt: post.updatedAt,
    authorName: article.author.name,
  })

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      type="application/ld+json"
    />
  )
}
