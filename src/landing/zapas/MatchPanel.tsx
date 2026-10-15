import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from '../components/Heading'

/**
 * Světlá karta jednoho bloku detailu zápasu (Branky, Tresty, Statistika,
 * Reportáž) — nadpis `h2` vlevo, volitelný doplněk (součet, počet) vpravo.
 *
 * Typografie celého detailu jede na standardní škále Tailwindu (rozhodnutí
 * uživatele 15. 10. 2026 — vlastní px tokeny 15/17/13 px se k sobě nehodily
 * a desktop po nich působil přerostle). Tři role, jeden skok na `md`:
 *
 * | role | mobil | `md` |
 * |---|---|---|
 * | nadpis panelu | `text-xl` | `text-2xl` |
 * | hlavní text (jména, hodnoty, odstavce) | `text-sm` | `text-base` |
 * | vedlejší text (časy, asistence, popisky, čísla tabulek) | `text-xs` | `text-xs` |
 *
 * Štítky verzálkami nad blokem (`Eyebrow`) a odznaky (`Badge`) mají
 * vlastní velikost svých komponent.
 *
 * Odsazení má tři stupně, ne dva (AGENTS.md → Responzivita): 18 px mobil,
 * 28 px tablet, 36 px desktop. Skok rovnou z 18 na 36 by na 768px displeji
 * sebral panelu pětinu šířky.
 */
export function MatchPanel({
  aside,
  children,
  className,
  id,
  title,
}: {
  /** Doplněk vpravo od nadpisu — zalamuje se pod něj. */
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
  id: string
  title: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'min-w-0 rounded-tile border border-line-soft bg-surface p-4.5 md:p-7 lg:p-9',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardTitle
          as="h2"
          className="text-xl leading-tight font-extrabold tracking-[-0.025em] md:text-2xl"
          id={id}
        >
          {title}
        </CardTitle>
        {aside}
      </div>
      {children}
    </section>
  )
}
