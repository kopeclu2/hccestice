import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/landing/ui/Badge'
import { EmptyState } from '@/landing/ui/EmptyState'
import { Eyebrow } from '@/landing/ui/Kicker'
import type { DateInput } from '@/lib/datetime'
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
 * Místo se píše jednou: když mají všechny termíny stejné, stojí v záhlaví
 * tabulky a z řádků zmizí (šestkrát „ZS Rychnov nad Kněžnou“ pod sebou byl
 * šum). Rozdílné místo (turnaj jinde) se v řádku ukáže dál.
 *
 * Mobil: nahoře den, datum a čas, pod tím skupina, poznámka a případné místo.
 * Od `md` sloupce den | čas | podrobnosti. Záhlaví je jen vizuální pomůcka:
 * řádky jsou popsané samy, proto je `aria-hidden`; sdílené místo je ale
 * skutečný text a čte se.
 *
 * Nejbližší termín nese štítek Dnes / Zítra. „Teď“ předává volající
 * (`now`), tabulka nevolá `new Date()` sama.
 *
 * `compact` (homepage) zmenší svislé odsazení řádků.
 *
 * Den v týdnu se počítá z data (`buildTrainingMonths`), neukládá se.
 */

const GRID_BASE =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4.5 md:gap-y-0 md:px-6 lg:px-7'
const GRID_WITH_DETAIL = 'md:grid-cols-[6rem_9rem_minmax(0,1fr)]'
const GRID_NO_DETAIL = 'md:grid-cols-[6rem_minmax(0,1fr)]'

const WHEN_LABEL = { today: 'Dnes', tomorrow: 'Zítra' } as const

/** Místo, které mají všechny termíny stejné; jinak `null`. */
function sharedVenue(months: TrainingMonthView[]): string | null {
  const venues = new Set(months.flatMap((month) => month.rows.map((row) => row.venue)))
  const [only] = venues
  return venues.size === 1 && only ? only : null
}

/** Řádek má co ukázat vedle dne a času? */
function hasDetail(row: TrainingRowView, venue: string | null): boolean {
  return Boolean(row.group || row.note || (!venue && row.venue))
}

export function TrainingsTable({
  sessions,
  monthHeadingAs: MonthHeading = 'h3',
  compact = false,
  now,
}: {
  sessions: TrainingSession[]
  /** Úroveň měsíčních nadpisů: `h2` pod `h1` stránky, `h3` pod nadpisem sekce. */
  monthHeadingAs?: 'h2' | 'h3'
  /** Kompaktní řádky pro homepage; celý rozpis na `/treninky` je volnější. */
  compact?: boolean
  /** „Teď“ pro štítek Dnes / Zítra; bez něj se štítek nekreslí. */
  now?: DateInput
}) {
  const months = buildTrainingMonths(sessions, now)
  const venue = sharedVenue(months)
  const withDetail = months.some((month) => month.rows.some((row) => hasDetail(row, venue)))
  const grid = cn(
    GRID_BASE,
    withDetail ? GRID_WITH_DETAIL : GRID_NO_DETAIL,
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
      {venue && (
        <p className="flex flex-wrap items-center gap-x-2.5 border-b border-line-soft bg-chip/50 px-4.5 py-3 text-sm font-semibold text-ink-soft md:px-6 lg:px-7">
          <Eyebrow tone="faint">Místo</Eyebrow>
          {venue}
        </p>
      )}

      {withDetail && (
        <div
          aria-hidden
          className={cn(
            GRID_BASE,
            GRID_WITH_DETAIL,
            'hidden border-b border-line-soft py-2.5 text-eyebrow font-bold tracking-caps-md text-faint uppercase md:grid',
          )}
        >
          <span>Den</span>
          <span>Čas</span>
          <span>{venue ? 'Skupina' : 'Skupina a místo'}</span>
        </div>
      )}

      {months.map((month) => (
        <section key={month.key} aria-label={month.label}>
          <MonthHeading className="border-b border-line-soft bg-chip/50 px-4.5 py-2 text-xs font-bold tracking-caps-sm text-ink-soft uppercase not-first:border-t md:px-6 lg:px-7">
            {month.label}
          </MonthHeading>
          <ul className="divide-y divide-line-soft">
            {month.rows.map((row) => (
              <TrainingRow
                detail={hasDetail(row, venue)}
                grid={grid}
                key={row.id}
                row={row}
                venue={venue}
              />
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
  venue,
  detail,
}: {
  row: TrainingRowView
  grid: string
  /** Sdílené místo — v řádku se nekreslí. */
  venue: string | null
  detail: boolean
}) {
  const muted = row.accent ? 'text-faint-dark' : 'text-faint'

  return (
    <li
      className={cn(
        grid,
        row.accent ? 'bg-contrast text-on-contrast' : 'transition-colors hover:bg-chip/40',
      )}
    >
      <time className="flex flex-wrap items-baseline gap-x-2 tabular-nums" dateTime={row.dateTime}>
        <span className={cn('w-6 text-xs font-semibold tracking-wider uppercase', muted)}>
          {row.weekday}
        </span>
        <span className="text-base leading-tight font-bold tracking-snug md:text-lg">
          {row.date}
        </span>
        {row.when && (
          <Badge className="self-center" size="xs" variant="lime">
            {WHEN_LABEL[row.when]}
          </Badge>
        )}
      </time>

      <span className="text-right text-sm font-semibold tabular-nums md:text-left md:text-base">
        {row.time}
      </span>

      {detail && (
        <div
          className={cn(
            'col-span-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium md:col-span-1 md:text-sm',
            row.accent ? 'text-on-contrast-muted' : 'text-dim',
          )}
        >
          {row.group && (
            <Badge size="xs" variant={row.accent ? 'lime' : 'chip'}>
              {row.group}
            </Badge>
          )}
          {!venue && row.venue && <span>{row.venue}</span>}
          {row.note && (
            <span className={row.accent ? 'text-on-contrast-subtle' : 'text-dim'}>{row.note}</span>
          )}
        </div>
      )}
    </li>
  )
}
