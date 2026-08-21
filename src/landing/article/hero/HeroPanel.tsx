import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PageTitle } from '../../components/Heading'
import { Watermark } from '../../components/Watermark'
import type { ArticleDetail } from '../../types'

import { AuthorMeta } from './AuthorMeta'
import { Breadcrumbs } from './Breadcrumbs'
import { CategoryBadge } from './CategoryBadge'

/**
 * Hero D · Zelený panel — klubově zelená karta s bílým šrafováním
 * a obrysovým watermarkem; text vlevo, menší fotka vpravo dole.
 */
export function HeroPanel({ article }: { article: ArticleDetail }) {
  return (
    <div className="relative z-1 mt-3.5">
      <div className="bg-club relative overflow-hidden rounded-section px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.25rem,4vw,4rem)] text-white max-md:px-4.5 max-md:py-6">
        <Watermark className="z-0 -right-12.5 -bottom-17.5 text-watermark-4xl tracking-[-0.06em] text-white/12">
          HCČ
        </Watermark>
        <div className="hatch-white pointer-events-none absolute inset-0" />

        <div className="relative grid items-end gap-[clamp(1.75rem,4vw,4rem)] md:grid-cols-[1.15fr_.85fr]">
          <div>
            <Breadcrumbs badge={article.badge} className="mb-5.5" tone="panel" />
            <CategoryBadge>{article.badge}</CategoryBadge>
            <PageTitle balance="pretty" className="mt-4.5 text-white" size="md">
              {article.title}
            </PageTitle>
            <AuthorMeta
              author={article.author}
              className="mt-6"
              dateLabel={article.dateLabel}
              readingLabel={article.readingLabel}
              tone="panel"
            />
          </div>

          <div className="bg-pine relative h-[clamp(15rem,26vw,21.25rem)] overflow-hidden rounded-thumb">
            {article.photo && (
              <Image
                alt={article.photo.alt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 48rem) 100vw, 40vw"
                src={getMediaUrl(article.photo.url)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
