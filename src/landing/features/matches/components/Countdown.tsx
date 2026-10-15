'use client'

import { COUNTDOWN_LIVE_TEXT, useCountdown } from './useCountdown'

/** Číslice odpočtu; pod 360 px o stupeň menší (viz komentář u řádku). */
const DIGITS =
  'text-[clamp(1.5rem,2.6vw,2.625rem)] font-extrabold tracking-tight max-[22.5rem]:text-2xl'

/**
 * Živý odpočet do úvodního buly (dny / hod / min / sek).
 *
 * Logiku (čas až po mountu, „--" ze serveru, text po vypršení cíle) drží
 * `useCountdown`; tahle komponenta řeší jen vzhled.
 */
export function Countdown({ targetISO }: { targetISO: string }) {
  const { units, live } = useCountdown(targetISO)

  if (live) {
    return (
      <div className="mt-2.5 flex items-center gap-2.5 text-white" role="status">
        <span className="size-2 flex-none rounded-full bg-lime shadow-ring-lime" />
        <span className="text-[clamp(1.125rem,1.8vw,1.625rem)] font-extrabold tracking-tight text-balance">
          {COUNTDOWN_LIVE_TEXT}
        </span>
      </div>
    )
  }

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
          <span className={index === units.length - 1 ? `text-lime ${DIGITS}` : DIGITS}>
            {unit.value}
          </span>
          <span className="text-xs font-medium text-white/55">{unit.label}</span>
        </span>
      ))}
    </div>
  )
}
