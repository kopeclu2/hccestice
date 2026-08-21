import React from 'react'

import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { Numeral } from '../components/Numeral'
import { Pagination } from '../components/Pagination'
import { PillLink } from '../components/PillLink'
import type { Outcome, ResultRow } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

/** Badge výsledku (handoff: výhra lime, remíza šedá, prohra cihlová). */
const BADGE: Record<Outcome, { label: string; variant: 'lime' | 'muted' | 'loss' }> = {
  win: { label: 'Výhra', variant: 'lime' },
  draw: { label: 'Remíza', variant: 'muted' },
  loss: { label: 'Prohra', variant: 'loss' },
}

/**
 * Odehrané zápasy — řádkové karty se stránkováním po šesti.
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
}: {
  rows: ResultRow[]
  page?: number
  totalPages?: number
  hrefFor?: (page: number) => string
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
}) {
  return (
    <div className="scroll-mt-5" id="odehrane">
      <SectionHead note="Výsledky" title="Odehrané zápasy" variant={headVariant}>
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      {rows.length === 0 ? (
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
          className="mt-5"
          icon="schedule"
          title="Zatím žádný odehraný zápas"
          titleAs="h3"
        >
          Za tuhle sezónu jsme ještě nehráli. Jakmile padne první buly, najdete tady výsledek i s
          třetinami.
        </EmptyState>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          {rows.map((row) => {
            const badge = BADGE[row.outcome]
            return (
              <div
                className="border-line-soft hover:border-club flex flex-wrap items-center gap-y-3 gap-x-4 rounded-row border bg-surface px-4.5 py-3.5 transition-colors"
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
                    handoffu ve prospěch delších českých názvů fází. */}
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
                    {row.title}
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
                </Badge>

                <Numeral className="ml-auto min-w-13 flex-none text-right md:ml-0" size="xs">
                  {row.score}
                  {row.suffix && <span className="text-faint text-meta"> {row.suffix}</span>}
                </Numeral>
              </div>
            )
          })}
        </div>
      )}

      {hrefFor && totalPages > 1 && (
        <Pagination hrefFor={hrefFor} page={page} totalPages={totalPages} variant="compact" />
      )}
    </div>
  )
}
