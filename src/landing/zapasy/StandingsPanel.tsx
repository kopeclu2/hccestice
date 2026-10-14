import React from 'react'

import { isOurTeam } from '@/ahl/ourTeam'
import { cn } from '@/utilities/ui'

import { EmptyState } from '../components/EmptyState'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { PillLink } from '../components/PillLink'
import type { StandingsContent, StandingsRow } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

/** Řádek naší tabulky se zvýrazní — jednotný helper s ostatními místy (`src/ahl/ourTeam`). */
const isUs = isOurTeam

/**
 * Šablony sloupců. Rozšířená tabulka (V / VP / PP / P a skóre) potřebuje
 * místo, které je jen v plné šířce panelu: pod `md` (mobil) se skrývá,
 * od `md` má celý panel (jedna kolona) dost, na `lg` se panel zužuje do
 * pravého sloupce (~380 px) a extra sloupce by sežraly název týmu, takže
 * se vrací základní čtveřice a plné sloupce naskočí až na `2xl`.
 */
const GRID_BASE =
  'grid-cols-[1.75rem_1fr_2rem_2.25rem] md:grid-cols-[2.25rem_1fr_2.75rem_2.75rem] md:px-3 lg:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] lg:px-3.5'
const GRID_EXTENDED =
  'grid-cols-[1.75rem_1fr_2rem_2.25rem] md:grid-cols-[2.25rem_1fr_2.5rem_2rem_2rem_2rem_2rem_4.5rem_2.75rem] md:px-3 lg:grid-cols-[2.75rem_1fr_3.25rem_3.25rem] lg:px-3.5 2xl:grid-cols-[2.25rem_1fr_2.5rem_2rem_2rem_2rem_2rem_4rem_2.5rem]'
/** Extra sloupce: skryté na mobilu i na `lg`–`xl`, kde je panel úzký. */
const EXTRA = 'hidden text-center md:block lg:hidden 2xl:block'

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
 * dvou sloupců se panel zužuje taky až tam (`zapasy/(vypis)/page.tsx`). Dokud
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
  // Výřez na home page (`limit`) zůstává ve čtyřech sloupcích; rozšíření
  // se kreslí, jen když ho mají všechny řádky (ručně vedené sezóny nemají).
  const extended = !limit && rows.length > 0 && rows.every((row) => row.wins != null && row.goalsFor != null)
  const gridCols = extended ? GRID_EXTENDED : GRID_BASE

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
          watermark="VČHL"
        >
          Tabulka VČHL se naplní, jakmile odehrajeme první zápasy sezóny.
        </EmptyState>
      ) : (
        <div className="border-line-soft mt-5 rounded-card border bg-surface px-1.5 py-2.5 md:px-2 md:py-3 lg:px-2.5 lg:py-3.5">
          <Eyebrow as="div" tone="dark">
            <div className={cn('grid px-2.5 py-2.5 md:py-2.75 lg:py-3', gridCols)}>
              <span>P</span>
              <span>Tým</span>
              <span className="text-center">Z</span>
              {extended && (
                <>
                  <span className={EXTRA} title="Výhry">V</span>
                  <span className={EXTRA} title="Výhry v prodloužení / na nájezdy">VP</span>
                  <span className={EXTRA} title="Prohry v prodloužení / na nájezdy">PP</span>
                  <span className={EXTRA} title="Prohry">P</span>
                  <span className={EXTRA} title="Skóre">Skóre</span>
                </>
              )}
              <span className="text-right">B</span>
            </div>
          </Eyebrow>

          {rows.map((row) => {
            const ours = isUs(row.team)
            return (
              <div
                className={cn(
                  'grid items-center rounded-field px-2.5 py-2.75 md:py-3 lg:py-3.25',
                  gridCols,
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
                {extended && (
                  <>
                    <span className={cn(EXTRA, 'text-faint text-meta font-semibold tabular-nums')}>
                      {row.wins ?? 0}
                    </span>
                    <span className={cn(EXTRA, 'text-faint text-meta font-semibold tabular-nums')}>
                      {row.otWins ?? 0}
                    </span>
                    <span className={cn(EXTRA, 'text-faint text-meta font-semibold tabular-nums')}>
                      {row.otLosses ?? 0}
                    </span>
                    <span className={cn(EXTRA, 'text-faint text-meta font-semibold tabular-nums')}>
                      {row.losses ?? 0}
                    </span>
                    <span className={cn(EXTRA, 'text-faint text-meta font-semibold tabular-nums')}>
                      {row.goalsFor ?? 0}:{row.goalsAgainst ?? 0}
                    </span>
                  </>
                )}
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
