import React from 'react'

import RichTextServer from '@/components/RichText/Server'
import { renderLegacyHtml } from '@/landing/lib/legacyEmbeds'
import { EmbedLoader } from '@/landing/ui/ClickToLoadEmbed'
import type { Post } from '@/payload-types'

/**
 * Šířka obrázku v těle: `max-w-article` (820 px) bez bočního `px-gutter`
 * (`clamp(14px, 3vw, 40px)`). Do 820 px je to ~94 vw, výš nejvýš 770 px.
 * Výchozí `100vw` posílalo na telefonu 750px variantu místo ~360px.
 */
const ARTICLE_IMAGE_SIZES = '(min-width: 51.25rem) 48rem, 94vw'

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
        <>
          <div
            className="legacy-html"
            dangerouslySetInnerHTML={{ __html: renderLegacyHtml(post.legacyHtml as string) }}
          />
          <EmbedLoader />
        </>
      ) : post.content ? (
        <RichTextServer
          data={post.content}
          eagerLeadMedia
          enableGutter={false}
          enableProse={false}
          mediaSizes={ARTICLE_IMAGE_SIZES}
        />
      ) : null}
    </div>
  )
}
