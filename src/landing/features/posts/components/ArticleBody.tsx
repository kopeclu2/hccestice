import React from 'react'

import RichTextServer from '@/components/RichText/Server'
import { sanitizeHtml } from '@/hooks/sanitizeHtml'
import type { Post } from '@/payload-types'

/**
 * Tělo článku — lexical rich text, nebo legacy HTML z importu.
 * Typografii obou variant sjednocuje utility `article-prose`
 * (globals.css): lead odstavec, nadpisy s lime akcentem, citace,
 * fotky s popiskem.
 */
export function ArticleBody({ post }: { post: Post }) {
  const isLegacy = post.contentType === 'html' && post.legacyHtml

  return (
    <div className="relative z-1 article-prose mx-auto mt-11 max-w-article px-gutter md:mt-14 lg:mt-18">
      {isLegacy ? (
        <div
          className="legacy-html"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.legacyHtml as string) }}
        />
      ) : post.content ? (
        <RichTextServer data={post.content} enableGutter={false} enableProse={false} />
      ) : null}
    </div>
  )
}
