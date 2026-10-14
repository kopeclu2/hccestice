import Image from 'next/image'
import React from 'react'

import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from '../../components/Badge'
import { BreadcrumbsJsonLd } from '../../components/BreadcrumbsJsonLd'
import { PageTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { Numeral } from '../../components/Numeral'
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
      <div className="bg-contrast relative overflow-hidden rounded-section px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2.25rem,4vw,3.75rem)] text-on-contrast max-md:px-4.5 max-md:py-6">
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
              {/* Dvě tečky, ne text „:" — Archivo kreslí dvojtečku jako dva
                  hranaté body, které v drobném řezu na tmavém pozadí čtou
                  jako náhodné čtverečky, ne jako oddělovač skóre. */}
              <span className="flex flex-col items-center gap-2.5 self-center">
                <span className="bg-white/30 size-2 rounded-full" />
                <span className="bg-white/30 size-2 rounded-full" />
              </span>
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

          {scoreboard.goals.length > 0 && (
            <GoalTimeline goals={scoreboard.goals} />
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
            <span className="text-caption font-bold text-white/60 tabular-nums">{goal.time}</span>
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
                  className={cn(
                    'text-meta font-extrabold',
                    goal.ours ? 'text-white' : 'text-white/65',
                  )}
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
                <div className="mt-0.5 pl-4 text-caption font-semibold text-white/55 text-pretty">
                  <span className="sr-only">Asistence: </span>
                  {goal.assists.join(', ')}
                </div>
              )}
            </div>
            {goal.score && (
              <span className="text-meta font-extrabold text-white/80 tabular-nums">
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
