import React from 'react'

import type { ArticleDetail } from '@/landing/features/posts/types'
import { CLUB_LOGO, CLUB_NAME } from '@/lib/club'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { serializeJsonLd } from '@/lib/jsonLd'
import { routes } from '@/lib/routes'
import type { Post } from '@/payload-types'

/**
 * JSON-LD (schema.org NewsArticle) pro vyhledávače.
 *
 * `datePublished` je pro Article rich results **povinné** a chybělo tu —
 * proto komponenta bere celý `post`, ne jen zobrazovací `article`.
 * `publisher.logo` musí být `ImageObject`, holé URL Google reportuje
 * jako chybu.
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
      name: CLUB_NAME,
      logo: { '@type': 'ImageObject', url: `${baseUrl}${CLUB_LOGO}` },
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
