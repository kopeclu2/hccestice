import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PageTitle } from '../../components/Heading'
import { Kicker } from '../../components/Kicker'
import type { ArticleDetail } from '../../types'

import { AuthorMeta } from './AuthorMeta'
import { Breadcrumbs } from './Breadcrumbs'
import { TitleParts } from './HeroTitle'

/**
 * Hero B · Rozdělené — text (drobečky, štítek, titulek s lime
 * podbarvením, perex, meta) vlevo, fotka s popiskem vpravo.
 */
export function HeroSplit({ article }: { article: ArticleDetail }) {
  return (
    <div className="relative z-1 mx-auto mt-11 grid max-w-[97.5rem] items-center gap-[clamp(1.75rem,4vw,4rem)] px-[clamp(0.875rem,3vw,2.5rem)] md:grid-cols-[1.05fr_.95fr]">
      <div>
        <Breadcrumbs badge={article.badge} className="mb-5" tone="light" />
        <Kicker>{article.badge}</Kicker>
        <PageTitle balance="pretty" className="mt-4.5" size="md">
          <TitleParts accent="lime-box" highlight={article.titleHighlight} title={article.title} />
        </PageTitle>
        {article.excerpt && (
          <p className="text-ink-soft mt-5 max-w-130 text-lead leading-relaxed text-pretty">
            {article.excerpt}
          </p>
        )}
        <AuthorMeta
          author={article.author}
          className="mt-6.5"
          dateLabel={article.dateLabel}
          readingLabel={article.readingLabel}
          tone="light"
        />
      </div>

      <div className="bg-pine relative h-[clamp(20rem,42vw,30rem)] overflow-hidden rounded-section">
        {article.photo && (
          <Image
            alt={article.photo.alt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 48rem) 100vw, 50vw"
            src={getMediaUrl(article.photo.url)}
          />
        )}
        {article.photoCaption && (
          <span className="bg-pine-deep/72 absolute bottom-4 left-4 rounded-full px-4 py-2 text-caption font-semibold text-white backdrop-blur-md">
            {article.photoCaption}
          </span>
        )}
      </div>
    </div>
  )
}
