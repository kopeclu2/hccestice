import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { MatchScoreboard } from '@/landing/features/matches/components/MatchScoreboard'
import type { ArticleDetail } from '@/landing/features/posts/types'
import { BreadcrumbsJsonLd } from '@/landing/layout/BreadcrumbsJsonLd'
import { DotEyebrow } from '@/landing/ui/DotEyebrow'
import { PageTitle } from '@/landing/ui/Heading'
import { getMediaUrl } from '@/lib/getMediaUrl'

import { articleTrail } from './articleTrail'
import { AuthorMeta } from './AuthorMeta'
import { TitleParts } from './HeroTitle'

/**
 * Hero E · Zápasový výsledek — tmavý panel s fotkou na pozadí,
 * výsledkovou tabulí (skóre + třetiny + znaky týmů) z navázaného zápasu
 * a titulkem. Střelci tu záměrně nejsou — dlouhý seznam patří na detail zápasu.
 *
 * Renderuje se jen s hotovým `scoreboard` — fallback řeší `toArticleDetail`.
 */
export function HeroMatch({ article }: { article: ArticleDetail }) {
  const scoreboard = article.scoreboard
  if (!scoreboard) return null

  return (
    <div className="relative z-1 mt-3.5">
      {/*
        Zbylé čtyři varianty hero (`HeroPhoto`, `HeroTypo`, `HeroPanel`,
        `HeroSplit`) emitují drobečky přes `ui/Breadcrumbs`, která
        si strukturovaná data nese s sebou. Zápasový hero je ale nemá —
        tmavý panel se scoreboardem je v handoffu bez nich — takže
        `BreadcrumbList` chyběl u zápasových reportáží, což je většina
        archivu. Emitor se proto volá napřímo: schema bez viditelné
        obdoby je pořád lepší než 58 % článků bez drobečkových dat.
      */}
      <BreadcrumbsJsonLd trail={articleTrail(article)} />
      <div className="relative overflow-hidden rounded-section bg-contrast px-panel py-panel-y text-on-contrast max-md:px-4.5 max-md:py-6">
        {article.photo && (
          <div className="absolute inset-0 opacity-16">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src={getMediaUrl(article.photo.url, article.photo.updatedAt)}
            />
          </div>
        )}
        {/* Scrim přes fotku musí zůstat tmavý i v dark režimu, proto `pine-deep`
            (téma-nezávislý podklad fotek), ne `ink` (barva textu). */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-pine-deep/55 to-pine-deep/92" />

        <div className="relative">
          <div className="flex items-start gap-x-2.5 gap-y-2">
            {/* Kicker je od zformátované soutěže delší („… · VČHL 2. ročník ·
                Základní část"), tečka proto drží první řádek (`DotEyebrow`). */}
            <DotEyebrow className="min-w-0 flex-1">{scoreboard.kicker}</DotEyebrow>
            <span className="hidden flex-none text-xs font-medium text-on-contrast-subtle md:block">
              {scoreboard.metaLine}
            </span>
          </div>

          <MatchScoreboard
            logos={{ home: scoreboard.logos.homeLogo, away: scoreboard.logos.awayLogo }}
            scoreboard={scoreboard}
          />

          {/* Průběh zápasu (střelci, tresty) je jen na detailu zápasu, hero ho
              nekopíruje. Odkaz stojí pod tabulí, ne v hlavičce panelu —
              tam by se na mobilu (metaLine je skrytá) ztratil mezi kickerem
              a skóre. */}
          {article.matchHref && (
            <div className="mt-[clamp(1.25rem,2.5vw,1.75rem)] flex justify-center">
              <Button asChild size="sm" variant="glass" withArrow>
                <Link href={article.matchHref}>Detail zápasu</Link>
              </Button>
            </div>
          )}

          <div className="my-[clamp(1.625rem,3vw,2.5rem)] h-px bg-on-contrast-glass" />

          <PageTitle balance="pretty" className="max-w-225 text-on-contrast" size="sm">
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
