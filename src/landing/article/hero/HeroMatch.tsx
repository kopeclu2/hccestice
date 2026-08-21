import Image from 'next/image'
import React from 'react'

import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from '../../components/Badge'
import { PageTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { Numeral } from '../../components/Numeral'
import type { ArticleDetail, ArticleScoreboard } from '../../types'

import { AuthorMeta } from './AuthorMeta'
import { TitleParts } from './HeroTitle'

/**
 * Hero E · Zápasový výsledek — tmavý panel s fotkou na pozadí,
 * výsledkovou tabulí (skóre + třetiny) z navázaného zápasu a titulkem.
 *
 * Renderuje se jen s hotovým `scoreboard` — fallback řeší `toArticleDetail`.
 */
export function HeroMatch({ article }: { article: ArticleDetail }) {
  const scoreboard = article.scoreboard
  if (!scoreboard) return null

  return (
    <div className="relative z-1 mt-3.5">
      <div className="bg-contrast relative overflow-hidden rounded-section px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.25rem,4vw,3.75rem)] text-on-contrast max-md:px-4.5 max-md:py-6">
        {article.photo && (
          <div className="absolute inset-0 opacity-16">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={getMediaUrl(article.photo.url)}
            />
          </div>
        )}
        {/* Scrim přes fotku musí zůstat tmavý i v dark režimu, proto `pine-deep`
            (téma-nezávislý podklad fotek), ne `ink` (barva textu). */}
        <div className="from-pine-deep/55 to-pine-deep/92 pointer-events-none absolute inset-0 bg-linear-to-b" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-lime size-2 flex-none rounded-full shadow-ring-lime" />
            <Eyebrow tone="lime">{scoreboard.kicker}</Eyebrow>
            <div className="flex-1" />
            <span className="hidden text-caption font-semibold text-white/60 md:block">
              {scoreboard.metaLine}
            </span>
          </div>

          <div className="my-[clamp(1.75rem,3vw,2.75rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3.5rem)] text-center">
            <div className="min-w-30 flex-1 text-right">
              <div className="text-[clamp(1.125rem,2vw,1.875rem)] font-extrabold tracking-[-0.02em]">
                {scoreboard.homeName}
              </div>
              <div className="mt-1 text-caption font-semibold text-white/55">Domácí</div>
            </div>

            <Numeral
              as="div"
              className="max-md:text-numeral-2xl flex flex-none items-baseline gap-3.5"
              size="score"
            >
              <span className={cn(scoreboard.weWon && scoreboard.weAreHome && 'text-lime')}>
                {scoreboard.homeScore}
              </span>
              <span className="text-[.6em] text-white/35">:</span>
              <span className={cn(scoreboard.weWon && !scoreboard.weAreHome && 'text-lime')}>
                {scoreboard.awayScore}
              </span>
              {scoreboard.suffix && (
                <span className="self-start text-[.3em] font-bold text-white/60">
                  {scoreboard.suffix}
                </span>
              )}
            </Numeral>

            <div className="min-w-30 flex-1 text-left">
              <div className="text-[clamp(1.125rem,2vw,1.875rem)] font-extrabold tracking-[-0.02em]">
                {scoreboard.awayName}
              </div>
              <div className="mt-1 text-caption font-semibold text-white/55">Hosté</div>
            </div>
          </div>

          {scoreboard.thirds.length > 0 && (
            <div className="flex justify-center gap-2">
              {scoreboard.thirds.map((third, index) => {
                // zvýrazněná je závěrečná třetina vítězného zápasu
                const winning = scoreboard.weWon && index === scoreboard.thirds.length - 1
                return (
                  <Badge
                    className={cn(
                      'text-white/70',
                      winning && 'border-lime/40 bg-lime/12 text-lime',
                    )}
                    key={index}
                    size="sm"
                    variant="glassOutline"
                  >
                    {third}
                  </Badge>
                )
              })}
            </div>
          )}

          <div className="my-[clamp(1.625rem,3vw,2.5rem)] h-px bg-white/16" />

          <PageTitle balance="pretty" className="max-w-225 text-white" size="sm">
            <TitleParts
              accent="lime-text"
              highlight={article.titleHighlight}
              title={article.title}
            />
          </PageTitle>

          <AuthorMeta
            author={article.author}
            className="mt-4"
            dateLabel={article.dateLabel}
            readingLabel={article.readingLabel}
            tone="plain"
          />
        </div>
      </div>
    </div>
  )
}
