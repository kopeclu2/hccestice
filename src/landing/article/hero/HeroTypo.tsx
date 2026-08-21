import React from 'react'

import { PageTitle } from '../../components/Heading'
import { Watermark } from '../../components/Watermark'
import type { ArticleDetail } from '../../types'

import { Breadcrumbs } from './Breadcrumbs'
import { CategoryBadge } from './CategoryBadge'
import { TitleParts } from './HeroTitle'

/**
 * Hero C · Typografické — bez fotky; obří titulek (základ regular,
 * zvýrazněná část tučně s lime podbarvením), watermark „HCČ"
 * a dvoubarevná dělicí linka. Univerzální fallback ostatních variant.
 */
export function HeroTypo({ article }: { article: ArticleDetail }) {
  const metaLine = [article.dateLabel, article.author.name, article.readingLabel]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="relative z-1 mx-auto mt-10 max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] md:mt-16">
      <Watermark className="text-club/13 -top-14 left-[60%] z-0 text-watermark-3xl tracking-[-0.06em]">
        HC ČESTICE
      </Watermark>

      <Breadcrumbs badge={article.badge} className="mb-5.5" tone="light" />

      <div className="flex flex-wrap items-center gap-2.5">
        <CategoryBadge>{article.badge}</CategoryBadge>
        <span className="text-faint text-caption font-semibold">{metaLine}</span>
      </div>

      {/* HeroTypo je designově odlišný — základní váha regular, jen zvýrazněná
          část tučně. */}
      <PageTitle className="mt-6 max-w-310" size="xl" weight="normal">
        <TitleParts
          accent="lime-box"
          highlight={article.titleHighlight}
          highlightClassName="font-extrabold px-3"
          title={article.title}
        />
      </PageTitle>

      {article.excerpt && (
        <p className="text-ink-soft mt-6.5 max-w-160 text-lead leading-relaxed text-pretty">
          {article.excerpt}
        </p>
      )}

      {/* Tmavý úsek linky je 180px. Na 320px to je 62 % šířky (na desktopu 13 %),
          takže se z akcentu stane půlka linky — pod `md` proto 80px. */}
      <div className="mt-8 h-0.5 [background:linear-gradient(90deg,var(--color-ink)_0_5rem,var(--color-line-mid)_5rem)] md:mt-10 md:[background:linear-gradient(90deg,var(--color-ink)_0_11.25rem,var(--color-line-mid)_11.25rem)]" />
    </div>
  )
}
