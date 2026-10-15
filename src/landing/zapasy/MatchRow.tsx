import React from 'react'

import { StretchedLink } from '../components/StretchedLink'
import { TeamPair } from '../components/TeamPair'
import type { Photo } from '../types'
import { Crest } from '../zapas/header-variants/shared'

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

/**
 * Datum zápasu — musí jít přečíst na první pohled (rozhodnutí uživatele
 * 15. 10. 2026): den v týdnu, výrazné datum, čas zvlášť.
 *
 * - Mobil: jeden řádek nad názvem — „SO 18. 10. · 16:30".
 * - Od `md` sloupec vlevo: den v týdnu, pod ním datum `text-lg`, pod ním čas.
 */
export function MatchWhen({
  date,
  weekday,
  time,
  dateTime,
}: {
  /** „18. 10." */
  date: string
  /** „so" */
  weekday: string
  time?: string | null
  /** ISO začátku zápasu pro `<time>`. */
  dateTime: string
}) {
  return (
    <time
      className="col-span-2 flex items-baseline gap-x-2 tabular-nums md:col-span-1 md:flex-col md:gap-0.5"
      dateTime={dateTime}
    >
      <span className="text-xs font-semibold tracking-wider text-faint uppercase">{weekday}</span>
      <span className="text-base leading-tight font-bold tracking-[-0.01em] md:text-lg">
        {date}
      </span>
      {time && (
        <span className="text-sm font-semibold text-ink-soft">
          <span aria-hidden className="text-faint md:hidden">
            ·{' '}
          </span>
          {time}
        </span>
      )}
    </time>
  )
}

/** Tým se znakem — znak je dekorace, jméno stojí vedle jako text. */
function TeamWithCrest({ name, logo }: { name: string; logo: Photo | null }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 align-middle">
      <Crest
        className="size-6 md:size-7"
        logo={logo}
        monogramClassName="text-xs"
        name={name}
        sizes="28px"
        tone="light"
      />
      <span className="min-w-0">{name}</span>
    </span>
  )
}

/**
 * Název zápasu se znaky týmů jako odkaz přes celý řádek. Týmy pod sebou na
 * všech šířkách — znaky lícují pod sebou bez ohledu na délku názvu a dlouhé
 * dvojice („HC Čestice × SK Divočáci Žamberk") se nelámou uprostřed týmu.
 */
export function MatchRowTitle({
  home,
  away,
  homeLogo,
  awayLogo,
  href,
}: {
  home: string
  away: string
  homeLogo: Photo | null
  awayLogo: Photo | null
  href: string | null
}) {
  return (
    <div className="text-sm leading-snug font-semibold tracking-[-0.01em] text-pretty md:text-base">
      <StretchedLink href={href}>
        <TeamPair
          away={<TeamWithCrest logo={awayLogo} name={away} />}
          home={<TeamWithCrest logo={homeLogo} name={home} />}
          layout="stack"
        />
      </StretchedLink>
    </div>
  )
}
