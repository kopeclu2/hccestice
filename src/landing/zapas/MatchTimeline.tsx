import React from 'react'

import { cn } from '@/lib/utils'

import { Badge } from '../components/Badge'
import { Eyebrow } from '../components/Kicker'
import { MatchMeta } from '../components/MatchMeta'
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

/**
 * Řádek osy: čas · ikona · obsah. Stav po brance stojí před jménem
 * (`EventScore` uvnitř obsahu), ne ve vlastním sloupci u pravého okraje —
 * v širokém panelu byl od jména daleko a oko ho k řádku nepřiřadilo.
 *
 * `items-start` + výška `h-5` / `md:h-6` u času, ikony a stavu = první
 * řádek obsahu (`text-sm` / `md:text-base` mají řádkování 20 / 24 px,
 * typografie viz `MatchPanel`): u víceřádkových řádků (dlouhé jméno, asistence, důvod
 * trestu) drží čas a ikonu u jména, ne uprostřed bloku.
 *
 * Od `md` mají řádky stejné vodorovné odsazení jako pruh třetiny nad nimi,
 * takže čas lícuje s „1. třetina" a stav se skóre úseku. Na mobilu by to
 * vzalo jménům čtvrtinu šířky; pruh tam proto přesahuje řádky.
 */
const ROW =
  'grid grid-cols-[2.25rem_1.25rem_minmax(0,1fr)] items-start gap-x-2 py-3 md:grid-cols-[3.25rem_2rem_minmax(0,1fr)] md:gap-x-4 md:px-4'

/** Buňka zarovnaná na první řádek obsahu. */
const CELL = 'flex h-5 items-center md:h-6'

/**
 * Časová osa zápasu ve stylu Livesportu, ale jen se stranou HC Čestice:
 * pruh třetiny se skóre úseku, pod ním události v pořadí, jak šly.
 *
 * - **Náš gól** — tmavý puk, stav v lime pilulce, střelec a PP/OS/SN,
 *   pod nimi asistence.
 * - **Gól soupeře** — světlý puk, název soupeře a tlumený stav, bez jmen
 *   hráčů (rozhodnutí uživatele 14. 10. 2026; jména ve view-modelu ani
 *   nejsou). Je tu jen proto, aby byl vidět průběh skóre.
 * - **Trest** — minuty v malém žlutém poli, vyšší tresty v červeném. Soupeřovy
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
            <h3 className="flex items-center justify-between gap-3 rounded-field bg-paper px-3 py-2 md:px-4">
              <Eyebrow tone="club">{period.label}</Eyebrow>
              {period.score && (
                <span className="text-sm font-bold tabular-nums">
                  <span className="sr-only">skóre </span>
                  {period.score.replace(':', ' : ')}
                </span>
              )}
            </h3>
            <ol className="divide-y divide-line-soft">
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
      <span className={cn(CELL, 'text-xs font-semibold text-faint tabular-nums')}>
        {event.time}
      </span>
      <span aria-hidden className={cn(CELL, 'justify-center')}>
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
          'inline-grid h-5 min-w-4 place-items-center rounded-sm px-0.75 text-eyebrow font-bold tabular-nums',
          event.minutes != null && event.minutes >= MAJOR_MINUTES
            ? 'bg-danger text-on-contrast'
            : 'bg-penalty text-penalty-ink',
        )}
      >
        {event.minutes ?? '–'}
      </span>
    )
  }
  // Puk bez podkladu: náš plný v barvě textu, soupeřův ztišený.
  return <PuckIcon className={cn('size-5', event.ours ? 'text-ink' : 'text-faint/45')} />
}

/**
 * Stav po brance v pořadí domácí : hosté. Náš gól má lime pilulku (stejný
 * akcent jako „Výhra" a „Doma" ve výpisech), soupeřův jen ztišené číslo.
 * Trest stav nemá. Pro čtečku stav ohlašuje `EventBody`, tady je skrytý.
 */
function EventScore({ event }: { event: MatchTimelineEvent }) {
  if (event.type !== 'goal' || !event.score) return null
  return event.ours ? (
    <Badge
      aria-hidden
      className="min-w-11 flex-none justify-center px-2 py-0.5 tabular-nums"
      size="sm"
      variant="lime"
    >
      {event.score}
    </Badge>
  ) : (
    <span
      aria-hidden
      className="inline-flex h-5 min-w-11 flex-none items-center justify-center text-xs font-bold text-faint tabular-nums md:h-6"
    >
      {event.score}
    </span>
  )
}

function EventBody({ event, opponentName }: { event: MatchTimelineEvent; opponentName: string }) {
  if (event.type === 'penalty') {
    return (
      <>
        <div className="text-sm font-bold text-pretty break-words md:text-base">
          <span className="sr-only">
            Trest{event.minutes != null ? ` ${event.minutes} min` : ''}:{' '}
          </span>
          {event.player}
        </div>
        {/* Druh a důvod se lámou mezi sebou, ne „Menší trest · | Nesportovní…“. */}
        <MatchMeta className="mt-0.5 text-xs" items={[event.kind, event.reason]} />
      </>
    )
  }

  if (!event.ours) {
    // Jméno soupeře se smí zalomit — výpustka („HC Aloha Lan…“) ho na
    // 320 px usekla v polovině. Pro čtečku ho nahrazuje „Gól soupeře“.
    return (
      <div className="flex items-start gap-x-2 text-sm font-semibold text-faint md:text-base">
        <span className="sr-only">
          {event.score ? `Gól soupeře, stav ${event.score}` : 'Gól soupeře'}
        </span>
        <EventScore event={event} />
        <span aria-hidden className="min-w-0 text-pretty break-words">
          {opponentName}
        </span>
      </div>
    )
  }

  const special = event.special ? SPECIAL[event.special] : null
  return (
    <>
      {/* Stav před jménem; asistence lícují se jménem, ne se stavem. Jméno
          a štítek PP/OS/SN jsou dvě položky flexu: štítek stojí za jménem
          a na další řádek spadne celý, jen když se vedle nevejde — nikdy
          neutrhne příjmení. */}
      <div className="flex items-start gap-x-2">
        <EventScore event={event} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 text-sm font-bold text-pretty break-words md:text-base">
              <span className="sr-only">
                {event.score ? `Gól HC Čestice, stav ${event.score}: ` : 'Gól HC Čestice: '}
              </span>
              {event.scorer}
            </span>
            {special && (
              <Badge
                className="px-2 py-0.5"
                size="xs"
                variant={event.special === 'sn' ? 'outline' : 'chip'}
              >
                {/* Zkratka je pro oko, celé slovo pro čtečku — `title` čtečky
                    většinou nečtou a na dotykovém displeji není vidět vůbec. */}
                <span aria-hidden>{special.label}</span>
                <span className="sr-only">{special.title}</span>
              </Badge>
            )}
          </div>
          {event.assists.length > 0 && (
            <div className="mt-0.5 text-xs font-medium text-pretty break-words text-faint">
              <span className="sr-only">Asistence: </span>
              <span aria-hidden>(</span>
              {event.assists.join(', ')}
              <span aria-hidden>)</span>
            </div>
          )}
        </div>
      </div>
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
