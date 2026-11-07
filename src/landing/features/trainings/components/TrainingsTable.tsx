import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/landing/ui/Badge'
import { EmptyState } from '@/landing/ui/EmptyState'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

import {
  buildTrainingMonths,
  type TrainingMonthView,
  type TrainingRowView,
  type TrainingSession,
} from '../view/trainingsTable'

/**
 * Rozpis tréninků jako tabulka — jedna karta, měsíce jako oddělovače a řádek
 * na termín. Karta i linky jsou stejné jako u výpisů zápasů (`rounded-tile`,
 * `border-line-soft`), takže se rozpis tváří jako zbytek webu.
 *
 * Mobil: nahoře den, datum a čas, pod tím skupina a místo. Od `md` sloupce
 * den | čas | skupina | místo se záhlavím. Záhlaví je jen vizuální pomůcka:
 * řádky jsou popsané samy, proto je `aria-hidden`.
 *
 * Sloupec Skupina se kreslí, jen když skupinu má aspoň polovina termínů.
 * Rozpis bývá bez skupiny skoro celý a prázdný sloupec jen zabíral šířku;
 * ojedinělá skupina pak stojí jako štítek v řádku místa.
 *
 * `compact` (homepage) zmenší svislé odsazení řádků.
 *
 * Den v týdnu se počítá z data (`buildTrainingMonths`), neukládá se.
 */

const GRID_BASE =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4.5 md:gap-y-0 md:px-6 lg:px-7'
const GRID_WITH_GROUP = 'md:grid-cols-[6rem_9rem_minmax(0,1fr)_minmax(0,1fr)]'
const GRID_NO_GROUP = 'md:grid-cols-[6rem_9rem_minmax(0,1fr)]'

/** Skupina je sloupec, jen když ji má aspoň polovina termínů. */
function hasGroupColumn(months: TrainingMonthView[]): boolean {
  const rows = months.flatMap((month) => month.rows)
  return rows.length > 0 && rows.filter((row) => row.group).length * 2 >= rows.length
}

export function TrainingsTable({
  sessions,
  monthHeadingAs: MonthHeading = 'h3',
  compact = false,
}: {
  sessions: TrainingSession[]
  /** Úroveň měsíčních nadpisů: `h2` pod `h1` stránky, `h3` pod nadpisem sekce. */
  monthHeadingAs?: 'h2' | 'h3'
  /** Kompaktní řádky pro homepage; celý rozpis na `/treninky` je volnější. */
  compact?: boolean
}) {
  const months = buildTrainingMonths(sessions)
  const withGroup = hasGroupColumn(months)
  const grid = cn(
    GRID_BASE,
    withGroup ? GRID_WITH_GROUP : GRID_NO_GROUP,
    compact ? 'py-2.5 md:py-3' : 'py-3.5 md:py-4',
  )

  if (months.length === 0) {
    return (
      <EmptyState
        actions={
          <>
            <Button asChild size="md" variant="dark" withArrow>
              <Link href={routes.contact}>Napsat klubu</Link>
            </Button>
            <Button asChild size="md" variant="outline">
              <Link href={routes.list.matches}>Zápasy</Link>
            </Button>
          </>
        }
        icon="schedule"
        title="Nejbližší tréninky zatím nejsou vypsané"
        titleAs="h3"
      >
        Rozpis na další týdny doplníme. Kdy se přijít podívat, vám rádi řekneme na kontaktu.
      </EmptyState>
    )
  }

  return (
    <div className="overflow-hidden rounded-tile border border-line-soft bg-surface">
      <div
        aria-hidden
        className={cn(
          GRID_BASE,
          withGroup ? GRID_WITH_GROUP : GRID_NO_GROUP,
          'hidden border-b border-line-soft bg-chip/50 py-3 text-eyebrow font-bold tracking-caps-md text-faint uppercase md:grid md:py-3',
        )}
      >
        <span>Den</span>
        <span>Čas</span>
        {withGroup && <span>Skupina</span>}
        <span>Místo</span>
      </div>

      {months.map((month) => (
        <section key={month.key} aria-label={month.label}>
          <MonthHeading className="border-b border-line-soft bg-chip/50 px-4.5 py-2 text-xs font-bold tracking-caps-sm text-ink-soft uppercase not-first:border-t md:px-6 lg:px-7">
            {month.label}
          </MonthHeading>
          <ul className="divide-y divide-line-soft">
            {month.rows.map((row) => (
              <TrainingRow grid={grid} key={row.id} row={row} withGroup={withGroup} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function TrainingRow({
  row,
  grid,
  withGroup,
}: {
  row: TrainingRowView
  grid: string
  withGroup: boolean
}) {
  const muted = row.accent ? 'text-faint-dark' : 'text-faint'

  return (
    <li
      className={cn(
        grid,
        row.accent ? 'bg-contrast text-on-contrast' : 'transition-colors hover:bg-chip/40',
      )}
    >
      <time className="flex items-baseline gap-x-2 tabular-nums" dateTime={row.dateTime}>
        <span className={cn('w-6 text-xs font-semibold tracking-wider uppercase', muted)}>
          {row.weekday}
        </span>
        <span className="text-base leading-tight font-bold tracking-snug md:text-lg">
          {row.date}
        </span>
      </time>

      <span className="text-right text-sm font-semibold tabular-nums md:text-left md:text-base">
        {row.time}
      </span>

      {withGroup && (
        <div className="col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 md:col-span-1">
          {row.group && (
            <Badge size="xs" variant={row.accent ? 'lime' : 'chip'}>
              {row.group}
            </Badge>
          )}
          {row.note && (
            <span className={cn('text-xs', row.accent ? 'text-on-contrast-subtle' : 'text-dim')}>
              {row.note}
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium md:col-span-1 md:text-sm',
          row.accent ? 'text-on-contrast-muted' : 'text-dim',
        )}
      >
        {!withGroup && row.group && (
          <Badge size="xs" variant={row.accent ? 'lime' : 'chip'}>
            {row.group}
          </Badge>
        )}
        <span>{row.venue}</span>
        {!withGroup && row.note && (
          <span className={row.accent ? 'text-on-contrast-subtle' : 'text-dim'}>{row.note}</span>
        )}
      </div>
    </li>
  )
}
