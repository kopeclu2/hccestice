import Image from 'next/image'
import React from 'react'

import { BreadcrumbsJsonLd } from '@/landing/layout/BreadcrumbsJsonLd'
import { Badge } from '@/landing/ui/Badge'
import { DotEyebrow } from '@/landing/ui/DotEyebrow'
import { PageTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { PillLink } from '@/landing/ui/PillLink'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'

import { MatchScoreboard } from '../../components/MatchScoreboard'
import type { ArticleDetail, ArticleGoal } from '../../types'

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
      {/*
        Zbylé čtyři varianty hero (`HeroFoto`, `HeroTypo`, `HeroPanel`,
        `HeroSplit`) emitují drobečky přes `article/hero/Breadcrumbs`, který
        si strukturovaná data nese s sebou. Zápasový hero je ale nemá —
        tmavý panel se scoreboardem je v handoffu bez nich — takže
        `BreadcrumbList` chyběl u zápasových reportáží, což je většina
        archivu. Emitor se proto volá napřímo: schema bez viditelné
        obdoby je pořád lepší než 58 % článků bez drobečkových dat.
      */}
      <BreadcrumbsJsonLd
        trail={[{ href: '/aktuality', label: 'Aktuality' }, { label: article.badge }]}
      />
      <div className="relative overflow-hidden rounded-section bg-contrast px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.25rem,4vw,3.75rem)] text-on-contrast max-md:px-4.5 max-md:py-6">
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
            <span className="hidden flex-none text-xs font-medium text-white/60 md:block">
              {scoreboard.metaLine}
            </span>
          </div>

          <MatchScoreboard scoreboard={scoreboard} />

          {scoreboard.goals.length > 0 && <GoalTimeline goals={scoreboard.goals} />}

          {/* Detail zápasu je jediné místo s tresty a statistikou; timeline
              tu je jen výřez. Odkaz stojí pod ním, ne v hlavičce panelu —
              tam by se na mobilu (metaLine je skrytá) ztratil mezi kickerem
              a skóre. */}
          {article.matchHref && (
            <div className="mt-[clamp(1.25rem,2.5vw,1.75rem)] flex justify-center">
              <PillLink href={article.matchHref} size="sm" variant="glass" withArrow>
                Detail zápasu
              </PillLink>
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

/** Štítek speciální situace u branky; nájezd je rozhodující branka zápasu. */
const SPECIAL_LABEL: Record<NonNullable<ArticleGoal['special']>, string> = {
  pp: 'PP',
  os: 'OS',
  sn: 'Rozhodující nájezd',
}
const SPECIAL_TITLE: Record<NonNullable<ArticleGoal['special']>, string> = {
  pp: 'Přesilovka',
  os: 'Oslabení',
  sn: 'Rozhodující nájezd',
}

/**
 * Průběh branek pod výsledkovou tabulí. Je to seznam (`<ol>`), ne tabulka:
 * každá branka je jedna věta „čas, kdo skóroval, s kým, jaký byl stav".
 * Naše branky se od soupeřových liší vedle barvy i slovem pro čtečku
 * (`sr-only`), aby rozdíl nestál jen na odstínu.
 *
 * Stav po brance je v pořadí domácí : hosté, stejně jako skóre nad ním.
 */
function GoalTimeline({ goals }: { goals: ArticleGoal[] }) {
  return (
    <div className="mx-auto mt-[clamp(1.5rem,3vw,2.25rem)] max-w-180">
      <Eyebrow as="div" tone="lime">
        Průběh zápasu
      </Eyebrow>
      <ol aria-label="Průběh branek" className="mt-3 divide-y divide-white/10">
        {goals.map((goal, index) => (
          <li
            className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-x-3 py-2.5 md:grid-cols-[3.5rem_1fr_auto] md:gap-x-4"
            key={index}
          >
            <span className="text-xs font-semibold text-white/60 tabular-nums">{goal.time}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  aria-hidden
                  className={cn(
                    'size-2 flex-none rounded-full',
                    goal.ours ? 'bg-lime' : 'border border-white/40',
                  )}
                />
                <span className="sr-only">{goal.ours ? 'Gól Čestic: ' : 'Gól soupeře: '}</span>
                <span
                  className={cn('text-sm font-bold', goal.ours ? 'text-white' : 'text-white/65')}
                >
                  {goal.scorer}
                </span>
                {goal.special && (
                  <Badge
                    className="px-2 py-0.5"
                    size="xs"
                    title={SPECIAL_TITLE[goal.special]}
                    variant={goal.special === 'sn' ? 'glassOutline' : 'glass'}
                  >
                    {SPECIAL_LABEL[goal.special]}
                  </Badge>
                )}
              </div>
              {goal.assists.length > 0 && (
                <div className="mt-0.5 pl-4 text-xs font-medium text-pretty text-white/55">
                  <span className="sr-only">Asistence: </span>
                  {goal.assists.join(', ')}
                </div>
              )}
            </div>
            {goal.score && (
              <span className="text-sm font-bold text-white/80 tabular-nums">
                <span className="sr-only">Stav </span>
                {goal.score}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
