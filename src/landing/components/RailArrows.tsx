'use client'

import React from 'react'

/**
 * Šipky vodorovného pásu karet — posun o šířku karty s mezerou (`step`).
 * Pás sám je scrollovatelný i prstem/trackpadem, šipky jsou jen
 * desktopová pohodlnost (handoff: na mobilu skryté).
 *
 * Jde o kolečka s ikonou, ne o CTA pilulku — `PillButton` je vždy
 * `rounded-full` s vodorovným paddingem pro text, sem se nevejde
 * (kruh o fixní velikosti bez paddingu), proto zůstávají vlastní `<button>`.
 *
 * `itemLabel` jde do `aria-label` („Předchozí zápasy", „Předchozí tréninky").
 * Čtečce nestačí „Předchozí" — na stránce může být pásů víc.
 */
export function RailArrows({
  targetId,
  itemLabel = 'zápasy',
  step = 324,
}: {
  targetId: string
  itemLabel?: string
  step?: number
}) {
  const scrollBy = (delta: number) => () => {
    document.getElementById(targetId)?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="hidden gap-2 md:flex">
      <button
        aria-label={`Předchozí ${itemLabel}`}
        className="border-line text-ink hover:bg-contrast grid size-9.5 cursor-pointer place-items-center rounded-full border bg-surface text-body font-bold transition-colors hover:text-on-contrast"
        onClick={scrollBy(-step)}
        type="button"
      >
        ←
      </button>
      <button
        aria-label={`Další ${itemLabel}`}
        className="bg-contrast text-lime hover:bg-club grid size-9.5 cursor-pointer place-items-center rounded-full text-body font-bold transition-colors"
        onClick={scrollBy(step)}
        type="button"
      >
        →
      </button>
    </div>
  )
}
