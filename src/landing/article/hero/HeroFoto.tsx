import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PageTitle } from '../../components/Heading'
import type { ArticleDetail } from '../../types'

import { AuthorMeta } from './AuthorMeta'
import { Breadcrumbs } from './Breadcrumbs'
import { CategoryBadge } from './CategoryBadge'
import { TitleParts } from './HeroTitle'

/**
 * Hero A · Velké foto — fotka přes celou šířku se zeleným multiply
 * filtrem, ztmavením a rozostřeným spodním pásem; titulek a meta dole.
 */
export function HeroFoto({ article }: { article: ArticleDetail }) {
  return (
    <div className="relative z-1 mt-3.5">
      <div className="bg-pine relative h-[min(66vh,41.25rem)] min-h-[32.5rem] overflow-hidden rounded-section max-md:h-auto max-md:min-h-[26.25rem]">
        {article.photo && (
          <Image
            alt={article.photo.alt}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={getMediaUrl(article.photo.url)}
          />
        )}
        {/* zelený klubový filtr + svislé ztmavení (čitelnost textu) */}
        <div className="pointer-events-none absolute inset-0 mix-blend-multiply [background:linear-gradient(160deg,--alpha(var(--color-club)/55%),--alpha(var(--color-club-dark)/30%)_55%,--alpha(var(--color-club-deep)/30%))]" />
        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,--alpha(var(--color-pine-deep)/34%)_0_12%,--alpha(var(--color-pine-deep)/2%)_38%,--alpha(var(--color-pine-deep)/60%)_70%,--alpha(var(--color-pine-deep)/92%))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] backdrop-blur-[6px] backdrop-saturate-[.85] [mask-image:linear-gradient(transparent,#000_62%)]" />

        <Breadcrumbs
          badge={article.badge}
          className="absolute top-6 left-[clamp(1.125rem,3vw,2.75rem)] z-2"
          tone="photo"
        />

        <div className="absolute inset-x-[clamp(1.125rem,3vw,3rem)] bottom-10 z-2">
          <CategoryBadge>{article.badge}</CategoryBadge>
          <PageTitle balance="pretty" className="mt-4.5 max-w-250 text-white" size="lg">
            <TitleParts
              accent="lime-text"
              highlight={article.titleHighlight}
              title={article.title}
            />
          </PageTitle>
          <AuthorMeta
            author={article.author}
            className="mt-5.5"
            dateLabel={article.dateLabel}
            readingLabel={article.readingLabel}
            tone="photo"
          />
        </div>
      </div>
    </div>
  )
}
