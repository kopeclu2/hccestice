import React from 'react'

import { StretchedLink } from '../components/StretchedLink'
import { TeamPair } from '../components/TeamPair'

/**
 * Společné díly řádku zápasu pro rozlosování (`FixturesRail` → `FixtureList`)
 * a odehrané zápasy (`ResultsList`). Oba výpisy jsou jedna rodina: stejná
 * karta, stejné sloupce, stejná typografie data, názvu i údajů pod ním —
 * dřív měly výsledky datum a fázi prostrkaným uppercase a rozlosování ne.
 */

/** Karta výpisu — řádky oddělené linkou. */
export const MATCH_LIST =
  'border-line-soft divide-line-soft divide-y overflow-hidden rounded-tile border bg-surface'

/**
 * Mřížka řádku. Mobil: datum přes celou šířku, pod ním název | pravý sloupec.
 * Od `md`: 96 px datum | název | pravý sloupec. Šířka 96 px, ne 64 px
 * z handoffu: „Čtvrtfinále" a „O 3. místo" se do 64 px nevešly (vědomá
 * odchylka, viz dřívější komentář v `ResultsList`).
 */
export const MATCH_ROW =
  'hover:bg-chip/40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4.5 py-3.5 transition-colors md:grid-cols-[6rem_minmax(0,1fr)_auto] md:gap-y-2 md:px-6 md:py-4 lg:px-7 lg:py-4.5'

/** Datum (a čas) — na mobilu v řádku nad názvem, od `md` sloupec vlevo. */
export function MatchWhen({
  date,
  time,
  dateTime,
}: {
  date: string
  time?: string | null
  /** ISO začátku zápasu pro `<time>`. */
  dateTime: string
}) {
  return (
    <time
      className="col-span-2 flex items-baseline gap-2 tabular-nums md:col-span-1 md:block"
      dateTime={dateTime}
    >
      <span className="block text-sm font-bold">{date}</span>
      {time && <span className="text-faint block text-xs font-semibold md:mt-0.5">{time}</span>}
    </time>
  )
}

/**
 * Název zápasu jako odkaz přes celý řádek. Na mobilu týmy pod sebou — dlouhé
 * dvojice („HC Čestice × SK Divočáci Žamberk") se jinak lámaly uprostřed
 * názvu týmu.
 */
export function MatchRowTitle({
  home,
  away,
  href,
}: {
  home: string
  away: string
  href: string | null
}) {
  return (
    <div className="text-sm md:text-base leading-snug font-semibold tracking-[-0.01em] text-pretty">
      <StretchedLink href={href}>
        <TeamPair away={away} home={home} layout="stack" />
      </StretchedLink>
    </div>
  )
}
