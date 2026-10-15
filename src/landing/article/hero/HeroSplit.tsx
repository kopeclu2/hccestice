import Image from 'next/image'
import React from 'react'

import type { ArticleDetail } from '@/landing/types'
import { PageTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { getMediaUrl } from '@/lib/getMediaUrl'

import { AuthorMeta } from './AuthorMeta'
import { Breadcrumbs } from './Breadcrumbs'
import { TitleParts } from './HeroTitle'

/**
 * Hero B · Rozdělené — text (drobečky, štítek, titulek s lime
 * podbarvením, perex, meta) vlevo, fotka s popiskem vpravo.
 *
 * Dva sloupce jsou desktopová kompozice handoffu, takže naskakují až na `lg`:
 * na 768px zbývalo na text ~350px a na fotku ~320px. Svislý start má tři
 * stupně (`mt-6 md:mt-13 lg:mt-16`) jako `HeroTypo` — ploché `mt-11` dávalo
 * mobilu desktopovou hodnotu.
 */
export function HeroSplit({ article }: { article: ArticleDetail }) {
  return (
    <div className="relative z-1 mx-auto mt-6 grid max-w-[97.5rem] items-center gap-[clamp(1.75rem,4vw,4rem)] px-[clamp(0.875rem,3vw,2.5rem)] md:mt-13 lg:mt-16 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <Breadcrumbs badge={article.badge} className="mb-5" tone="light" />
        <Kicker>{article.badge}</Kicker>
        <PageTitle balance="pretty" className="mt-4.5" size="sm">
          <TitleParts accent="lime-box" highlight={article.titleHighlight} title={article.title} />
        </PageTitle>
        {article.excerpt && (
          <p className="mt-5 max-w-130 text-lg leading-relaxed text-pretty text-ink-soft">
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

      <div className="relative h-[clamp(20rem,42vw,30rem)] overflow-hidden rounded-section bg-pine">
        {article.photo && (
          <Image
            alt={article.photo.alt}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 64rem) 100vw, 50vw"
            src={getMediaUrl(article.photo.url, article.photo.updatedAt)}
          />
        )}
        {article.photoCaption && (
          <span className="absolute bottom-4 left-4 rounded-full bg-pine-deep/72 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
            {article.photoCaption}
          </span>
        )}
      </div>
    </div>
  )
}
