import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { Eyebrow } from '../components/Kicker'
import { countLabel } from '../data/format'
import type { ArticleGoal, MatchTimelineEvent, MatchTimelinePeriod } from '../types'

import { MatchPanel } from './MatchPanel'

/** Štítek speciální situace u branky; zkratka dostane celé slovo pro čtečku. */
const SPECIAL: Record<NonNullable<ArticleGoal['special']>, { label: string; title: string }> = {
  pp: { label: 'PP', title: 'Přesilovka' },
  os: { label: 'OS', title: 'Oslabení' },
  sn: { label: 'SN', title: 'Rozhodující nájezd' },
}

/** Od kolika minut je trest „vyšší" (5, osobní 10, do konce utkání 20) — červené pole. */
const MAJOR_MINUTES = 5

/** Řádek osy: čas · ikona · obsah. Sloupce drží zarovnání napříč třetinami. */
const ROW =
  'grid grid-cols-[2.5rem_1.75rem_1fr] items-center gap-x-2.5 py-3 md:grid-cols-[3.25rem_2rem_1fr] md:gap-x-4'

/**
 * Časová osa zápasu ve stylu Livesportu, ale jen se stranou HC Čestice:
 * pruh třetiny se skóre úseku, pod ním události v pořadí, jak šly.
 *
 * - **Náš gól** — puk v lime kruhu, stav, střelec, PP/OS/SN, asistence.
 * - **Gól soupeře** — prázdný kroužek a tlumený stav, bez jmen (rozhodnutí
 *   uživatele 14. 10. 2026; jména ve view-modelu ani nejsou). Je tu jen
 *   proto, aby byl vidět průběh skóre.
 * - **Trest** — minuty ve žlutém poli, vyšší tresty v červeném. Soupeřovy
 *   tresty zápis do CMS neukládá.
 *
 * Stav po brance je v pořadí domácí : hosté, stejně jako tabule v hlavičce.
 * Ikony a pole jsou `aria-hidden`; význam nese `sr-only` text na začátku
 * řádku, barva ani tvar k tomu samy nestačí.
 */
export function MatchTimeline({
  goalsOurs,
  opponentName,
  penaltyMinutes,
  periods,
}: {
  goalsOurs: number
  opponentName: string
  penaltyMinutes: number
  periods: MatchTimelinePeriod[]
}) {
  if (periods.length === 0) return null
  const hasPenalties = periods.some((period) =>
    period.events.some((event) => event.type === 'penalty'),
  )

  return (
    <MatchPanel
      aside={
        <Badge size="sm" variant="chip">
          {/* Osa jen s tresty by jinak hlásila „0 gólů · 4 TM". */}
          {(goalsOurs > 0 || !hasPenalties) && countLabel(goalsOurs, ['gól', 'góly', 'gólů'])}
          {hasPenalties && (
            <>
              {goalsOurs > 0 && ' · '}
              {`${penaltyMinutes}\u00a0`}
              <span aria-hidden>TM</span>
              <span className="sr-only">trestných minut</span>
            </>
          )}
        </Badge>
      }
      id="zapas-prubeh"
      title="Průběh zápasu"
    >
      <div className="mt-5 space-y-5 md:space-y-6">
        {periods.map((period) => (
          <div key={period.label}>
            <h3 className="bg-paper rounded-field flex items-center justify-between gap-3 px-3.5 py-2 md:px-4">
              <Eyebrow tone="club">{period.label}</Eyebrow>
              {period.score && (
                <span className="text-meta font-extrabold tabular-nums">
                  <span className="sr-only">skóre </span>
                  {period.score.replace(':', ' : ')}
                </span>
              )}
            </h3>
            <ol className="divide-line-soft divide-y">
              {period.events.map((event, index) => (
                <TimelineRow
                  event={event}
                  key={`${event.type}-${event.time}-${index}`}
                  opponentName={opponentName}
                />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </MatchPanel>
  )
}

function TimelineRow({ event, opponentName }: { event: MatchTimelineEvent; opponentName: string }) {
  return (
    <li className={ROW}>
      <span className="text-faint text-caption font-bold tabular-nums">{event.time}</span>
      <span aria-hidden className="flex justify-center">
        <EventIcon event={event} />
      </span>
      <div className="min-w-0">
        <EventBody event={event} opponentName={opponentName} />
      </div>
    </li>
  )
}

function EventIcon({ event }: { event: MatchTimelineEvent }) {
  if (event.type === 'penalty') {
    return (
      <span
        className={cn(
          'inline-grid h-7 min-w-5.5 place-items-center rounded-md px-1 text-caption font-extrabold tabular-nums',
          event.minutes != null && event.minutes >= MAJOR_MINUTES
            ? 'bg-danger text-on-contrast'
            : 'bg-penalty text-penalty-ink',
        )}
      >
        {event.minutes ?? '–'}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'grid size-7 place-items-center rounded-full',
        event.ours ? 'bg-lime text-ink' : 'border-line text-faint border',
      )}
    >
      <PuckIcon className="size-4" />
    </span>
  )
}

function EventBody({ event, opponentName }: { event: MatchTimelineEvent; opponentName: string }) {
  if (event.type === 'penalty') {
    const detail = [event.kind, event.reason].filter(Boolean).join(' · ')
    return (
      <>
        <div className="text-body font-extrabold [overflow-wrap:anywhere]">
          <span className="sr-only">
            Trest{event.minutes != null ? ` ${event.minutes} min` : ''}:{' '}
          </span>
          {event.player}
        </div>
        {detail && (
          <div className="text-faint mt-0.5 text-caption font-semibold text-pretty [overflow-wrap:anywhere]">
            {detail}
          </div>
        )}
      </>
    )
  }

  if (!event.ours) {
    return (
      // Jeden řádek i na 320 px: jméno soupeře se zkrátí výpustkou, stav ne.
      <div className="text-faint flex items-baseline gap-x-2 text-body font-bold">
        <span className="sr-only">{event.score ? 'Gól soupeře, stav ' : 'Gól soupeře: '}</span>
        {event.score && <span className="flex-none tabular-nums">{event.score}</span>}
        <span aria-hidden className="min-w-0 truncate">
          {opponentName}
        </span>
      </div>
    )
  }

  const special = event.special ? SPECIAL[event.special] : null
  return (
    <>
      {/* Stav drží u střelce: lámat se smí jméno (a štítek za ním), ne
          mezera mezi stavem a jménem — na 320 px by stav visel na vlastním řádku. */}
      <div className="flex items-baseline gap-x-2 text-body font-extrabold">
        <span className="sr-only">
          {event.score ? 'Gól HC Čestice, stav ' : 'Gól HC Čestice: '}
        </span>
        {event.score && <span className="flex-none tabular-nums">{event.score}</span>}
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {event.scorer}
          {special && (
            <Badge
              className="ml-2 px-2 py-0.5 align-middle"
              size="xs"
              variant={event.special === 'sn' ? 'outline' : 'lime'}
            >
              {/* Zkratka je pro oko, celé slovo pro čtečku — `title` čtečky
                většinou nečtou a na dotykovém displeji není vidět vůbec. */}
              <span aria-hidden>{special.label}</span>
              <span className="sr-only">{special.title}</span>
            </Badge>
          )}
        </span>
      </div>
      {event.assists.length > 0 && (
        <div className="text-faint mt-0.5 text-caption font-semibold text-pretty [overflow-wrap:anywhere]">
          <span className="sr-only">Asistence: </span>
          <span aria-hidden>(</span>
          {event.assists.join(', ')}
          <span aria-hidden>)</span>
        </div>
      )}
    </>
  )
}

/** Puk z boku — `lucide-react` hokejový puk nemá. Barvu bere z `currentColor`. */
function PuckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 10.5v4c0 2.2 4 4 9 4s9-1.8 9-4v-4c0 2.2-4 4-9 4s-9-1.8-9-4Z" />
      <ellipse cx="12" cy="10.5" fillOpacity="0.55" rx="9" ry="4" />
    </svg>
  )
}
