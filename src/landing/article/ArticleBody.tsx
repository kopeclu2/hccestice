import type { Post } from '@/payload-types'

import React from 'react'

import RichTextServer from '@/components/RichText/Server'

/**
 * Tělo článku — lexical rich text, nebo legacy HTML z importu.
 * Typografii obou variant sjednocuje utility `article-prose`
 * (globals.css): lead odstavec, nadpisy s lime akcentem, citace,
 * fotky s popiskem.
 */
export function ArticleBody({ post }: { post: Post }) {
  const isLegacy = post.contentType === 'html' && post.legacyHtml

  return (
    <div className="article-prose relative z-1 mx-auto mt-11 max-w-[51.25rem] md:mt-18 px-[clamp(0.875rem,3vw,2.5rem)]">
      {isLegacy ? (
        <div
          className="legacy-html"
          dangerouslySetInnerHTML={{ __html: post.legacyHtml as string }}
        />
      ) : post.content ? (
        <RichTextServer data={post.content} enableGutter={false} enableProse={false} />
      ) : null}
    </div>
  )
}
