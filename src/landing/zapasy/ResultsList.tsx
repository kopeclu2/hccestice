import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { Numeral } from '../components/Numeral'
import { Pagination } from '../components/Pagination'
import { PillLink } from '../components/PillLink'
import { StretchedLink, stretchHost } from '../components/StretchedLink'
import { OUTCOME_BADGE } from '../components/outcome'
import type { ResultRow } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

/**
 * Odehrané zápasy — jedna karta s řádky oddělenými linkou, stejně jako
 * rozlosování (`FixturesRail` → `FixtureList`), stránkování po šesti.
 * Stav stránkování žije v URL (`?strana=`), odkazy dodá volající.
 *
 * Bez `hrefFor` se stránkování nevykreslí, hlavička dostane proklik
 * `moreHref` a přes `headVariant` i styl nadpisu landingu — takhle
 * sekci používá výřez na home page.
 */
export function ResultsList({
  rows,
  page = 1,
  totalPages = 1,
  hrefFor,
  moreHref,
  moreLabel = 'Všechny výsledky',
  headVariant,
  showScorers = false,
}: {
  rows: ResultRow[]
  page?: number
  totalPages?: number
  hrefFor?: (page: number) => string
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
  /** Pod výsledkem řádek se střelci (jen /zapasy; výřez na home page je beze změny). */
  showScorers?: boolean
}) {
  return (
    <div className="scroll-mt-8 flex h-full flex-col" id="odehrane">
      <SectionHead note="Výsledky" title="Odehrané zápasy" variant={headVariant}>
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      {rows.length === 0 ? (
        /* `flex-1 justify-center`: když je i sousední `StandingsPanel`
           prázdný, mřížka na /zapasy obě karty roztáhne na stejnou výšku
           (`items-stretch` jen pro tenhle případ, viz `page.tsx`) — obsah
           se pak vycentruje uprostřed vyšší karty místo přilepení nahoře. */
        <EmptyState
          actions={
            <>
              <PillLink href="/aktuality" size="md" variant="dark" withArrow>
                Sledovat aktuality
              </PillLink>
              <PillLink href="/zapasy#rozlosovani" size="md" variant="outline">
                Rozlosování
              </PillLink>
            </>
          }
          className="mt-5 flex-1 justify-center"
          icon="schedule"
          title="Zatím žádný odehraný zápas"
          titleAs="h3"
          watermark="VČHL"
        >
          Za tuhle sezónu jsme ještě nehráli. Jakmile padne první buly, najdete tady výsledek i s
          třetinami.
        </EmptyState>
      ) : (
        <ol className="border-line-soft divide-line-soft mt-5 divide-y overflow-hidden rounded-tile border bg-surface">
          {rows.map((row) => {
            const badge = OUTCOME_BADGE[row.outcome]
            return (
              <li
                className={cn(
                  'hover:bg-chip/40 flex flex-wrap items-center gap-y-3 gap-x-4 px-4.5 py-3.5 transition-colors md:px-6 md:py-4 lg:px-7 lg:py-4.5',
                  // Karta má `overflow-hidden`, takže obrys uvnitř, ne vně řádku.
                  stretchHost,
                  'has-[[data-stretched]:focus-visible]:-outline-offset-2',
                )}
                key={row.id}
              >
                {/* Na mobilu datum a fáze vedle sebe v samostatném řádku:
                    do desktopových 64 px se „ČTVRTFINÁLE" ani „O 3. místo"
                    nevejde a sloupeček se lisoval do dvou–tří řádků, vedle
                    kterých zbyl pruh prázdna přes celou šířku karty.

                    Od `md` je sloupec 96 px, ne 64 px jako v handoffu. Handoff
                    do něj sází „18. KOLO", naše data „Čtvrtfinále" a „O 3.
                    místo" — ty se do 64 px nevejdou ani s prostrkáním podle
                    designu, přetékaly do názvu zápasu a u „O 3. místo" navíc
                    zvedaly řádek ze 44 na 68 px. Je to vědomá odchylka od
                    handoffu ve prospěch delších českých názvů fází. Šířku
                    sdílí s rozlosováním, takže oba výpisy lícují. */}
                <div className="flex w-full items-baseline gap-2.5 md:w-24 md:flex-none md:block">
                  <div className="text-meta font-extrabold tabular-nums">{row.dateLabel}</div>
                  <Eyebrow className="md:mt-0.5" tight tone="dark">
                    {row.stage}
                  </Eyebrow>
                </div>

                {/* min-w-40: na mobilu se titulek nelisuje do sloupečku, badge se skóre
                    se místo toho zalomí na druhý řádek (handoff: data-m-wrap) */}
                <div className="min-w-40 flex-1">
                  <div className="text-body font-bold tracking-[-0.01em] text-pretty">
                    {/* Celý řádek je klikací (stretched link na titulku). */}
                    <StretchedLink href={row.href}>{row.title}</StretchedLink>
                  </div>
                  {/* Místo zápasu je v handoffu běžný text (11px, semibold),
                      ne uppercase eyebrow — z „RYCHNOV NAD KNĚŽNOU" byl
                      prostrkaný uppercase přes půl karty, který přebíjel
                      samotný název zápasu nad sebou. */}
                  {row.venue && (
                    <div className="text-faint mt-0.5 text-eyebrow font-semibold">{row.venue}</div>
                  )}
                </div>

                <Badge className="flex-none md:ml-auto" variant={badge.variant}>
                  {badge.label}
                  {badge.note && <span className="sr-only"> {badge.note}</span>}
                </Badge>

                <Numeral className="ml-auto min-w-13 flex-none text-right md:ml-0" size="xs">
                  {row.score}
                  {row.suffix && <span className="text-faint text-meta"> {row.suffix}</span>}
                </Numeral>

                {/* Střelci jedou na vlastním řádku přes celou šířku karty
                    (`basis-full`); od `md` odsazení srovnané se sloupcem
                    názvu zápasu (96 px datum + mezera 16 px). */}
                {showScorers && row.scorers && (
                  <p className="text-faint basis-full text-caption font-semibold text-pretty md:pl-28">
                    <span className="text-ink font-bold">Střelci:</span> {row.scorers}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {hrefFor && totalPages > 1 && (
        <Pagination hrefFor={hrefFor} page={page} totalPages={totalPages} variant="compact" />
      )}
    </div>
  )
}
