'use client'

import React from 'react'

/**
 * Živý odpočet do úvodního buly (dny / hod / min / sek).
 *
 * Hodnoty se počítají až po mountu (na serveru čas neznáme přesně a
 * lišil by se od klienta — hydration mismatch), do té doby se zobrazí
 * „--". Po vypršení cíle (buly už proběhla) odpočet nahradí text, že zápas
 * probíhá — řada nul by tvrdila, že se teprve začíná. Stránka je
 * prerenderovaná, takže tohle musí rozhodnout klient; server vždy kreslí
 * „--".
 */
/** Číslice odpočtu; pod 360 px o stupeň menší (viz komentář u řádku). */
const DIGITS =
  'text-[clamp(1.5rem,2.6vw,2.625rem)] font-extrabold tracking-tight max-[22.5rem]:text-2xl'

export function Countdown({ targetISO }: { targetISO: string }) {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null)

  React.useEffect(() => {
    const target = new Date(targetISO).getTime()
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()))
    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [targetISO])

  if (remainingMs === 0) {
    return (
      <div className="mt-2.5 flex items-center gap-2.5 text-white" role="status">
        <span className="bg-lime shadow-ring-lime size-2 flex-none rounded-full" />
        <span className="text-[clamp(1.125rem,1.8vw,1.625rem)] font-extrabold tracking-tight text-balance">
          Zápas právě probíhá nebo čeká na výsledek
        </span>
      </div>
    )
  }

  const pad = (value: number) => String(value).padStart(2, '0')
  const units: Array<{ label: string; value: string }> =
    remainingMs === null
      ? [
          { label: 'dní', value: '--' },
          { label: 'hod', value: '--' },
          { label: 'min', value: '--' },
          { label: 'sek', value: '--' },
        ]
      : [
          { label: 'dní', value: pad(Math.floor(remainingMs / 86_400_000)) },
          { label: 'hod', value: pad(Math.floor(remainingMs / 3_600_000) % 24) },
          { label: 'min', value: pad(Math.floor(remainingMs / 60_000) % 60) },
          { label: 'sek', value: pad(Math.floor(remainingMs / 1_000) % 60) },
        ]

  return (
    /* `flex-wrap` a nižší spodní hranice clampu: čtyři jednotky se na 320px
       do řádku nevejdou a `overflow-hidden` karty odřízl poslední z nich
       („19 mi"). Číslice a její popisek jsou přitom ve vlastní skupině —
       bez ní se řádek zalomil mezi „42" a „min". Pod 360 px jsou číslice
       a mezery o stupeň menší, jinak „sek" na 320px telefonu padala
       na druhý řádek. */
    <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-white tabular-nums max-[22.5rem]:gap-x-2 md:gap-x-3.5">
      {units.map((unit, index) => (
        <span className="flex items-baseline gap-1.5 max-[22.5rem]:gap-1" key={unit.label}>
          <span
            className={
              index === units.length - 1
                ? `text-lime ${DIGITS}`
                : DIGITS
            }
          >
            {unit.value}
          </span>
          <span className="text-xs font-semibold text-white/55">{unit.label}</span>
        </span>
      ))}
    </div>
  )
}
