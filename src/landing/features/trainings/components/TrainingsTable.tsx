import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/landing/ui/Badge'
import { EmptyState } from '@/landing/ui/EmptyState'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

import {
  buildTrainingMonths,
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
 * Den v týdnu se počítá z data (`buildTrainingMonths`), neukládá se.
 */

const GRID =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4.5 py-3.5 md:grid-cols-[6rem_9rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-y-0 md:px-6 md:py-4 lg:px-7'

export function TrainingsTable({ sessions }: { sessions: TrainingSession[] }) {
  const months = buildTrainingMonths(sessions)

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
          GRID,
          'hidden border-b border-line-soft bg-chip/50 py-3 text-eyebrow font-bold tracking-caps-md text-faint uppercase md:grid md:py-3',
        )}
      >
        <span>Den</span>
        <span>Čas</span>
        <span>Skupina</span>
        <span>Místo</span>
      </div>

      {months.map((month) => (
        <section key={month.key} aria-label={month.label}>
          <h3 className="border-b border-line-soft bg-chip/50 px-4.5 py-2 text-xs font-bold tracking-caps-sm text-ink-soft uppercase not-first:border-t md:px-6 lg:px-7">
            {month.label}
          </h3>
          <ul className="divide-y divide-line-soft">
            {month.rows.map((row) => (
              <TrainingRow key={row.id} row={row} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function TrainingRow({ row }: { row: TrainingRowView }) {
  const muted = row.accent ? 'text-faint-dark' : 'text-faint'

  return (
    <li
      className={cn(
        GRID,
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

      <span
        className={cn(
          'col-span-2 text-xs font-medium md:col-span-1 md:text-sm',
          row.accent ? 'text-on-contrast-muted' : 'text-dim',
        )}
      >
        {row.venue}
      </span>
    </li>
  )
}
