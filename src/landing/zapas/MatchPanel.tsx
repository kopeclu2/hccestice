import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from '../components/Heading'

/**
 * Světlá karta jednoho bloku detailu zápasu (Branky, Tresty, Statistika,
 * Reportáž) — nadpis `h2` vlevo, volitelný doplněk (součet, počet) vpravo.
 *
 * Typografie celého detailu stojí na čtyřech rolích, které od `lg`
 * o stupeň rostou (na 1440 px byl 15px text v širokých panelech drobný):
 *
 * | role | mobil | `lg` |
 * |---|---|---|
 * | nadpis panelu | `text-card-title` 21 px | `md:` `text-panel-title` 26 px |
 * | hlavní text (jména, hodnoty, odstavce) | `text-body` 15 px | `text-lead` 17 px |
 * | vedlejší text (časy, asistence, popisky, čísla tabulek) | `text-caption` 12 px | `text-meta` 13 px |
 * | štítek nad blokem (`Eyebrow`) | `text-eyebrow` 11 px | beze změny |
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
        'border-line-soft min-w-0 rounded-tile border bg-surface p-4.5 md:p-7 lg:p-9',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardTitle
          as="h2"
          className="text-card-title leading-tight font-extrabold tracking-[-0.025em] md:text-panel-title"
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
