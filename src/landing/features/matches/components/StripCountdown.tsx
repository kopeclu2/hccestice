'use client'

import { CountdownText } from './CountdownText'
import { COUNTDOWN_PENDING, useCountdown } from './useCountdown'

/**
 * Kompaktní odpočet do buly pro proužek pod hero: „za 5 d 12 h" / „za 3 h 20 min".
 *
 * Logiku drží `useCountdown` (server kreslí „--" přes CSS `content`, takže
 * nesmyslný text nejde do SSR HTML). Po uplynutí cíle ukáže, že zápas běží.
 */
export function StripCountdown({ targetISO }: { targetISO: string }) {
  const { units, live } = useCountdown(targetISO)

  if (live) {
    return (
      <span className="text-xs font-bold text-club-dark md:text-sm" role="status">
        Právě probíhá
      </span>
    )
  }

  const [days, hours, minutes] = units
  const pending = days.value === COUNTDOWN_PENDING
  const text =
    pending || Number(days.value) > 0
      ? `za ${days.value} d ${hours.value} h`
      : `za ${Number(hours.value)} h ${minutes.value} min`

  return (
    <span className="text-xs font-bold text-club-dark tabular-nums md:text-sm">
      <CountdownText pending={pending} text={text} />
    </span>
  )
}
