import React from 'react'

import { cn } from '@/utilities/ui'

import { EmptyState } from '../components/EmptyState'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { PillLink } from '../components/PillLink'
import type { StandingsContent, StandingsRow } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

/** Řádek naší tabulky se zvýrazní (jediné místo, kde se tým pozná podle jména). */
const isUs = (team: string): boolean => /čestice/i.test(team)

/**
 * Zkrácení tabulky pro výřez na home page: čelo tabulky a k němu vždy
 * řádek Čestic (když leží mimo, nahradí poslední zobrazený řádek).
 */
function trimRows(rows: StandingsRow[], limit: number): StandingsRow[] {
  if (rows.length <= limit) return rows

  const head = rows.slice(0, limit)
  if (head.some((row) => isUs(row.team))) return head

  const ours = rows.find((row) => isUs(row.team))
  return ours ? [...head.slice(0, limit - 1), ours] : head
}

/**
 * Tabulka soutěže v sezóně — sloupce Pořadí / Tým / Zápasy / Body.
 * Data se udržují ručně v dokumentu sezóny (Sezóny → Tabulka ligy).
 *
 * Číselné sloupce jsou na mobilu užší (a řádek má menší odsazení), protože
 * desktopová šířka 44/52/52 px nechala na 320px displeji na název týmu
 * ~104 px — „HC Spartak Choceň B" se odřízl na „HC Spartak …", zatímco
 * ve sloupcích pro dvojciferná čísla zůstala polovina místa nevyužitá.
 * Škála má **tři stupně**: desktopová šířka začíná až na `lg`, protože do
 * dvou sloupců se panel zužuje taky až tam (`zapasy/page.tsx`). Dokud
 * naskakovala na `md`, byl sloupec „Tým" na 1024px užší (~209 px) než na
 * 390px telefonu a názvy se `truncate` ořezávaly.
 *
 * `limit` zkrátí výpis (výřez na home page), `moreHref` přidá proklik
 * a `headVariant` přepne styl nadpisu na landingový.
 */
export function StandingsPanel({
  standings,
  title = 'Tabulka',
  limit,
  moreHref,
  moreLabel = 'Celá tabulka',
  headVariant,
}: {
  standings: StandingsContent
  /** Nadpis sekce — na landingu „Tabulka VČHL" kvůli lime zvýraznění ligy. */
  title?: string
  limit?: number
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
}) {
  const rows = limit ? trimRows(standings.rows, limit) : standings.rows

  return (
    <div className="flex h-full flex-col">
      <SectionHead
        note={standings.seasonLabel}
        noteMuted={false}
        title={title}
        variant={headVariant}
      >
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      {rows.length === 0 ? (
        /* `flex-1 justify-center`: viz stejný komentář v `ResultsList` —
           obě prázdné karty vedle sebe drží stejnou výšku a obsah se
           vycentruje, ne přilepí nahoru. */
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
          title="Tabulka zatím neběží"
          titleAs="h3"
        >
          Tabulka VČHL se naplní, jakmile odehrajeme první zápasy sezóny.
        </EmptyState>
      ) : (
        <div className="border-line-soft mt-5 rounded-card border bg-surface px-1.5 py-2.5 md:px-2 md:py-3 lg:px-2.5 lg:py-3.5">
          <Eyebrow as="div" tone="dark">
            <div className="grid grid-cols-[1.75rem_1fr_2rem_2.25rem] px-2.5 py-2.5 md:grid-cols-[2.25rem_1fr_2.75rem_2.75rem] md:px-3 md:py-2.75 lg:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] lg:px-3.5 lg:py-3">
              <span>P</span>
              <span>Tým</span>
              <span className="text-center">Z</span>
              <span className="text-right">B</span>
            </div>
          </Eyebrow>

          {rows.map((row) => {
            const ours = isUs(row.team)
            return (
              <div
                className={cn(
                  'grid grid-cols-[1.75rem_1fr_2rem_2.25rem] items-center rounded-field px-2.5 py-2.75 md:grid-cols-[2.25rem_1fr_2.75rem_2.75rem] md:px-3 md:py-3 lg:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] lg:px-3.5 lg:py-3.25',
                  ours && 'bg-tint',
                )}
                key={`${row.pos}-${row.team}`}
              >
                <span
                  className={cn(
                    'text-meta font-extrabold tabular-nums',
                    ours ? 'text-club' : 'text-faint-dark',
                  )}
                >
                  {row.pos}.
                </span>
                <span
                  className={cn(
                    'truncate text-meta tracking-[-0.01em]',
                    ours ? 'font-extrabold' : 'font-semibold',
                  )}
                >
                  {row.team}
                </span>
                <span className="text-faint text-center text-meta font-semibold tabular-nums">
                  {row.games}
                </span>
                <span className="text-right text-meta font-extrabold tabular-nums">
                  {row.points}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
