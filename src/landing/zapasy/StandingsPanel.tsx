import React from 'react'

import { cn } from '@/utilities/ui'

import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
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
    <div>
      <SectionHead
        note={standings.seasonLabel}
        noteMuted={false}
        title={title}
        variant={headVariant}
      >
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      <div className="border-line-soft mt-5 rounded-card border bg-surface px-1.5 py-2.5">
        <Eyebrow as="div" tone="dark">
          <div className="grid grid-cols-[1.75rem_1fr_2rem_2.25rem] px-2.5 py-2.5 md:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] md:px-3.5">
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
                'grid grid-cols-[1.75rem_1fr_2rem_2.25rem] items-center rounded-field px-2.5 py-2.75 md:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] md:px-3.5',
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
              <span className="text-right text-meta font-extrabold tabular-nums">{row.points}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
