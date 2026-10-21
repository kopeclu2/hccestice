'use client'

import React from 'react'

export type CountdownUnit = { label: string; value: string }

/** Věta, která po uplynutí cíle nahradí řadu nul. */
export const COUNTDOWN_LIVE_TEXT = 'Zápas právě probíhá nebo čeká na výsledek'

/** Hodnota odpočtu, dokud se čas nespočítal (server, první render klienta). */
export const COUNTDOWN_PENDING = '--'

const pad = (value: number): string => String(value).padStart(2, '0')

/**
 * Zbývající čas na dny / hodiny / minuty / vteřiny. `null` (ještě se
 * nepočítalo — server, první render) dává „--", aby se HTML ze serveru
 * shodovalo s prvním renderem klienta.
 */
export const toCountdownUnits = (remainingMs: number | null): CountdownUnit[] =>
  remainingMs === null
    ? [
        { label: 'dní', value: COUNTDOWN_PENDING },
        { label: 'hod', value: COUNTDOWN_PENDING },
        { label: 'min', value: COUNTDOWN_PENDING },
        { label: 'sek', value: COUNTDOWN_PENDING },
      ]
    : [
        { label: 'dní', value: pad(Math.floor(remainingMs / 86_400_000)) },
        { label: 'hod', value: pad(Math.floor(remainingMs / 3_600_000) % 24) },
        { label: 'min', value: pad(Math.floor(remainingMs / 60_000) % 60) },
        { label: 'sek', value: pad(Math.floor(remainingMs / 1_000) % 60) },
      ]

/**
 * Živý odpočet do úvodního buly.
 *
 * Čas se počítá až po mountu (na serveru ho neznáme přesně a lišil by se
 * od klienta — hydration mismatch), do té doby `units` ukazují „--".
 * `live` je `true`, jakmile cíl uplynul: komponenta má místo nul vykreslit
 * text, že zápas probíhá. Stránka je prerenderovaná, takže to musí rozhodnout
 * klient; server `live` nikdy nevrátí.
 */
export function useCountdown(targetISO: string): { units: CountdownUnit[]; live: boolean } {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null)

  React.useEffect(() => {
    const target = new Date(targetISO).getTime()
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()))
    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [targetISO])

  return { units: toCountdownUnits(remainingMs), live: remainingMs === 0 }
}
