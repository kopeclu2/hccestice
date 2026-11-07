import Link from 'next/link'
import React from 'react'

import { isOurTeam } from '@/ahl/ourTeam'
import { Button } from '@/components/ui/button'
import type { StandingsContent, StandingsRow } from '@/landing/features/matches/types'
import { EmptyState } from '@/landing/ui/EmptyState'
import { MoreLink } from '@/landing/ui/MoreLink'
import { cn } from '@/lib/utils'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

/** Řádek naší tabulky se zvýrazní — jednotný helper s ostatními místy (`src/ahl/ourTeam`). */
const isUs = isOurTeam

/**
 * Šablony sloupců. Základní čtveřice (pořadí, tým, zápasy, body) platí pro
 * ručně vedené sezóny. Rozšířená tabulka ze synchronizace má dvě šířky:
 *
 * - **kompaktní** (mobil, `lg`–`xl`, kde se panel zužuje do pravého sloupce):
 *   navíc V / VP / PP / P, tedy bez skóre — součet V + VP + PP + P musí dát Z
 *   a název týmu se na úzkém displeji zalomí,
 * - **plná** (`md` v jedné koloně a od `2xl`): V / VP / PP / P a skóre.
 *
 * Skryté sloupce (`EXTRA`) mají `display: none`, takže se do mřížky
 * nepočítají a každý stupeň má vlastní počet drah.
 */
const GRID_BASE =
  'grid-cols-[1.75rem_minmax(0,1fr)_2rem_2.25rem] md:grid-cols-[2.25rem_minmax(0,1fr)_2.75rem_2.75rem] md:px-3 lg:grid-cols-[2.75rem_minmax(0,1fr)_3.25rem_3.25rem] lg:px-3.5'
const GRID_EXTENDED =
  'grid-cols-[1.5rem_minmax(0,1fr)_1.5rem_1.375rem_1.375rem_1.375rem_1.375rem_1.75rem] md:grid-cols-[2.25rem_minmax(0,1fr)_2.5rem_2rem_2rem_2rem_2rem_4.5rem_2.75rem] md:px-3 lg:grid-cols-[2rem_minmax(0,1fr)_2rem_1.75rem_1.75rem_1.75rem_1.75rem_2.25rem] lg:px-3.5 2xl:grid-cols-[2.25rem_minmax(0,1fr)_2.5rem_2rem_2rem_2rem_2rem_4rem_2.5rem]'
/** Extra sloupec skóre: jen v plné šířce (`md` a `2xl`). */
const EXTRA = 'hidden text-center md:block lg:hidden 2xl:block'
/** Sloupce V / VP / PP / P: vidět vždy, i v kompaktní šířce (jinak by V + PP + P nedalo Z). */
const STAT = 'text-center'

/** Popisky sloupců — jediný zdroj pro `abbr title` v hlavičce i pro legendu. */
const LEGEND_BASE: Array<[string, string]> = [
  ['Z', 'zápasy'],
  ['B', 'body'],
]
const LEGEND_EXTENDED: Array<[string, string]> = [
  ['Z', 'zápasy'],
  ['V', 'výhry'],
  ['VP', 'výhry po prodloužení nebo nájezdech'],
  ['PP', 'prohry po prodloužení nebo nájezdech'],
  ['P', 'prohry'],
  ['B', 'body'],
]

/**
 * Zkrácení tabulky pro výřez na home page: čelo tabulky a k němu vždy
 * řádek Čestic (když leží mimo, nahradí poslední zobrazený řádek).
 */
function trimRows(rows: StandingsRow[], limit: number): StandingsRow[] {
  if (rows.length <= limit) return rows

  const head = rows.slice(0, limit)
  if (head.some((row) => isUs(row.team))) return head

  const ours = rows.find((row) => isUs(row.team))
  // Poslední zobrazený řádek nahradí náš; pořadí zůstává vzestupné, takže
  // skok v pořadí (5. → 8.) je vidět a vykreslí se jako „…".
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
 * `limit` zkrátí výpis (výřez na home page), `moreHref` přidá proklik,
 * `headVariant` přepne styl nadpisu na landingový a `officialHref` přidá pod
 * tabulku odkaz na oficiální tabulky VČHL.
 */
export function StandingsPanel({
  standings,
  title = 'Tabulka',
  limit,
  moreHref,
  moreLabel = 'Celá tabulka',
  headVariant,
  officialHref,
}: {
  standings: StandingsContent
  /** Nadpis sekce — na landingu „Tabulka VČHL" kvůli lime zvýraznění ligy. */
  title?: string
  limit?: number
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
  /** Odkaz na oficiální tabulky VČHL pod tabulkou (otevře se v nové záložce). */
  officialHref?: string | null
}) {
  const rows = limit ? trimRows(standings.rows, limit) : standings.rows
  // Rozšíření se kreslí, jen když ho mají všechny řádky (ručně vedené
  // sezóny nemají).
  const extended =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.wins != null &&
        row.otLosses != null &&
        row.losses != null &&
        row.otWins != null &&
        row.goalsFor != null,
    )
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
              <Button asChild size="md" variant="dark" withArrow>
                <Link href="/aktuality">Sledovat aktuality</Link>
              </Button>
              <Button asChild size="md" variant="outline">
                <Link href="/zapasy#rozlosovani">Rozlosování</Link>
              </Button>
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
        /* Sémantická tabulka (`<caption>`, `scope`), ale vzhled drží `display: grid`
           na řádcích. Safari a starší prohlížeče při změně `display` zahodí
           sémantiku tabulky, proto jsou role zapsané výslovně. */
        <table
          className="mt-5 block rounded-tile border border-line-soft bg-surface px-1.5 py-2.5 md:px-2 md:py-3 lg:px-2.5 lg:py-3.5"
          role="table"
        >
          <caption className="sr-only">{`Tabulka soutěže: ${standings.seasonLabel}`}</caption>
          <thead className="block" role="rowgroup">
            <tr
              className={cn(
                'grid px-1 py-2.5 text-eyebrow font-bold tracking-caps-lg text-faint uppercase md:py-2.75 lg:py-3',
                gridCols,
              )}
              role="row"
            >
              <th className="text-left font-bold" role="columnheader" scope="col">
                <abbr className="no-underline" title="Pořadí">
                  #
                </abbr>
              </th>
              <th className="text-left font-bold" role="columnheader" scope="col">
                Tým
              </th>
              <th className="text-center font-bold" role="columnheader" scope="col">
                <abbr className="no-underline" title="Zápasy">
                  Z
                </abbr>
              </th>
              {extended && (
                <>
                  <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                    <abbr className="no-underline" title="Výhry">
                      V
                    </abbr>
                  </th>
                  <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                    <abbr className="no-underline" title="Výhry v prodloužení / na nájezdy">
                      VP
                    </abbr>
                  </th>
                  <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                    <abbr className="no-underline" title="Prohry v prodloužení / na nájezdy">
                      PP
                    </abbr>
                  </th>
                  <th className={cn(STAT, 'font-bold')} role="columnheader" scope="col">
                    <abbr className="no-underline" title="Prohry">
                      P
                    </abbr>
                  </th>
                  <th className={cn(EXTRA, 'font-bold')} role="columnheader" scope="col">
                    Skóre
                  </th>
                </>
              )}
              <th className="text-right font-bold" role="columnheader" scope="col">
                <abbr className="no-underline" title="Body">
                  B
                </abbr>
              </th>
            </tr>
          </thead>

          <tbody className="block" role="rowgroup">
            {rows.map((row, index) => {
              const ours = isUs(row.team)
              const previous = rows[index - 1]
              // Výřez přeskočil řádky (např. 5. → 8.): oddělovač „…" říká,
              // že tabulka pokračuje, ne že skončila.
              const skipped = previous !== undefined && row.pos - previous.pos > 1
              return (
                <React.Fragment key={`${row.pos}-${row.team}`}>
                  {skipped && (
                    <tr className="grid grid-cols-1" role="row">
                      <td
                        aria-label="Další řádky tabulky jsou vynechané"
                        className="py-0.5 text-center text-sm leading-none font-bold tracking-widest text-faint"
                        role="cell"
                      >
                        …
                      </td>
                    </tr>
                  )}
                  <tr
                    className={cn(
                      'grid items-center rounded-field px-1 py-2.75 md:py-3 lg:py-3.25',
                      gridCols,
                      ours && 'bg-tint',
                    )}
                    role="row"
                  >
                    <td
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        ours ? 'text-ink' : 'text-faint',
                      )}
                      role="cell"
                    >
                      {row.pos}.
                    </td>
                    <th
                      className={cn(
                        // Zalomit, ne zkrátit: „Závodní hokejová Pa…" na mobilu
                        // neříkalo, kdo to je. Delší název udělá řádek o kus
                        // vyšší, čísla zůstanou na středu (`items-center`).
                        'min-w-0 text-left text-sm leading-snug tracking-snug text-pretty break-words',
                        ours ? 'font-bold' : 'font-medium',
                      )}
                      role="rowheader"
                      scope="row"
                    >
                      {row.team}
                    </th>
                    <td
                      className="text-center text-sm font-medium text-faint tabular-nums"
                      role="cell"
                    >
                      {row.games}
                    </td>
                    {extended && (
                      <>
                        <td
                          className={cn(STAT, 'text-sm font-medium text-faint tabular-nums')}
                          role="cell"
                        >
                          {row.wins ?? 0}
                        </td>
                        <td
                          className={cn(STAT, 'text-sm font-medium text-faint tabular-nums')}
                          role="cell"
                        >
                          {row.otWins ?? 0}
                        </td>
                        <td
                          className={cn(STAT, 'text-sm font-medium text-faint tabular-nums')}
                          role="cell"
                        >
                          {row.otLosses ?? 0}
                        </td>
                        <td
                          className={cn(STAT, 'text-sm font-medium text-faint tabular-nums')}
                          role="cell"
                        >
                          {row.losses ?? 0}
                        </td>
                        <td
                          className={cn(EXTRA, 'text-sm font-medium text-faint tabular-nums')}
                          role="cell"
                        >
                          {row.goalsFor ?? 0}:{row.goalsAgainst ?? 0}
                        </td>
                      </>
                    )}
                    <td className="text-right text-sm font-bold tabular-nums" role="cell">
                      {row.points}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      )}
      {rows.length > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-faint">
          {(extended ? LEGEND_EXTENDED : LEGEND_BASE).map(([abbr, meaning], index) => (
            <React.Fragment key={abbr}>
              {index > 0 && ' · '}
              <span className="whitespace-nowrap">
                <b className="font-bold text-ink-soft">{abbr}</b> {meaning}
              </span>
            </React.Fragment>
          ))}
        </p>
      )}
      {officialHref && (
        <Button asChild className="mt-4 self-start" size="sm" variant="outline">
          <Link href={officialHref} rel="noreferrer" target="_blank">
            Oficiální tabulky VČHL ↗
          </Link>
        </Button>
      )}
    </div>
  )
}
