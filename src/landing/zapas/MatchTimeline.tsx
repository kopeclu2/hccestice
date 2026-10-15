import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { Eyebrow } from '../components/Kicker'
import { countLabel } from '../data/format'
import type { ArticleGoal, MatchTimelineEvent, MatchTimelinePeriod } from '../types'

import { MatchMeta } from '../components/MatchMeta'

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
 * Řádek osy: čas · ikona · obsah · stav. Stav po brance má vlastní sloupec
 * vpravo, takže jména střelců, trestaných a soupeře začínají ve všech
 * řádcích na stejné svislici (dřív stav stál před jménem jen u branek
 * a asistence pod ním lícovaly se stavem, ne se jménem).
 *
 * `items-start` + výška `h-5.5` u času, ikony a stavu = první řádek obsahu
 * (`leading-5.5`): u víceřádkových řádků (dlouhé jméno, asistence, důvod
 * trestu) drží čas a ikonu u jména, ne uprostřed bloku.
 *
 * Od `md` mají řádky stejné vodorovné odsazení jako pruh třetiny nad nimi,
 * takže čas lícuje s „1. třetina" a stav se skóre úseku. Na mobilu by to
 * vzalo jménům čtvrtinu šířky; pruh tam proto přesahuje řádky.
 */
const ROW =
  'grid grid-cols-[2.25rem_1.25rem_minmax(0,1fr)_auto] items-start gap-x-2 py-3 md:grid-cols-[3.25rem_2rem_minmax(0,1fr)_auto] md:gap-x-4 md:px-4'

/** Buňka zarovnaná na první řádek obsahu. */
const CELL = 'flex h-5.5 items-center'

/**
 * Časová osa zápasu ve stylu Livesportu, ale jen se stranou HC Čestice:
 * pruh třetiny se skóre úseku, pod ním události v pořadí, jak šly.
 *
 * - **Náš gól** — tmavý puk, střelec, pod ním PP/OS/SN a asistence,
 *   vpravo stav v lime pilulce.
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
            <h3 className="bg-paper rounded-field flex items-center justify-between gap-3 px-3 py-2 md:px-4">
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
      <span className={cn(CELL, 'text-faint text-caption font-bold tabular-nums')}>
        {event.time}
      </span>
      <span aria-hidden className={cn(CELL, 'justify-center')}>
        <EventIcon event={event} />
      </span>
      <div className="min-w-0">
        <EventBody event={event} opponentName={opponentName} />
      </div>
      <span className={cn(CELL, 'justify-end')}>
        <EventScore event={event} />
      </span>
    </li>
  )
}

function EventIcon({ event }: { event: MatchTimelineEvent }) {
  if (event.type === 'penalty') {
    return (
      <span
        className={cn(
          'inline-grid h-5 min-w-4 place-items-center rounded-sm px-0.75 text-eyebrow font-extrabold tabular-nums',
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
    <Badge aria-hidden className="px-2 py-0.5 tabular-nums" size="sm" variant="lime">
      {event.score}
    </Badge>
  ) : (
    <span aria-hidden className="text-faint px-2 text-caption font-extrabold tabular-nums">
      {event.score}
    </span>
  )
}

function EventBody({ event, opponentName }: { event: MatchTimelineEvent; opponentName: string }) {
  if (event.type === 'penalty') {
    return (
      <>
        <div className="text-body leading-5.5 font-extrabold text-pretty break-words">
          <span className="sr-only">
            Trest{event.minutes != null ? ` ${event.minutes} min` : ''}:{' '}
          </span>
          {event.player}
        </div>
        {/* Druh a důvod se lámou mezi sebou, ne „Menší trest · | Nesportovní…“. */}
        <MatchMeta className="mt-0.5" items={[event.kind, event.reason]} />
      </>
    )
  }

  if (!event.ours) {
    // Jméno soupeře se smí zalomit — výpustka („HC Aloha Lan…“) ho na
    // 320 px usekla v polovině. Pro čtečku ho nahrazuje „Gól soupeře“.
    return (
      <div className="text-faint text-body leading-5.5 font-bold text-pretty break-words">
        <span className="sr-only">
          {event.score ? `Gól soupeře, stav ${event.score}` : 'Gól soupeře'}
        </span>
        <span aria-hidden>{opponentName}</span>
      </div>
    )
  }

  const special = event.special ? SPECIAL[event.special] : null
  return (
    <>
      {/* Jméno a štítek PP/OS/SN jsou dvě položky flexu: štítek stojí za
          jménem a na další řádek spadne celý, jen když se vedle nevejde —
          nikdy neutrhne příjmení. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-body leading-5.5 min-w-0 font-extrabold text-pretty break-words">
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
        <div className="text-faint mt-0.5 text-caption font-semibold text-pretty break-words">
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
