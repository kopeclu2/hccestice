'use client'

import { CountdownText } from './CountdownText'
import { COUNTDOWN_LIVE_TEXT, COUNTDOWN_PENDING, useCountdown } from './useCountdown'

/** Číslice odpočtu; pod 360 px o stupeň menší (viz komentář u řádku). */
const DIGITS = 'text-countdown font-extrabold tracking-tight max-3xs:text-2xl'

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
      <div className="mt-2.5 flex items-center gap-2.5 text-on-contrast" role="status">
        <span className="size-2 flex-none rounded-full bg-lime shadow-ring-lime" />
        <span className="text-countdown-label font-extrabold tracking-tight text-balance">
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
    <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-on-contrast tabular-nums max-3xs:gap-x-2 md:gap-x-3.5">
      {units.map((unit, index) => (
        <span className="flex items-baseline gap-1.5 max-3xs:gap-1" key={unit.label}>
          <span className={index === units.length - 1 ? `text-lime ${DIGITS}` : DIGITS}>
            <CountdownText pending={unit.value === COUNTDOWN_PENDING} text={unit.value} />
          </span>
          <span className="text-xs font-medium text-on-contrast-subtle">
            <CountdownText pending={unit.value === COUNTDOWN_PENDING} text={unit.label} />
          </span>
        </span>
      ))}
    </div>
  )
}
