import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from '../components/Heading'

/**
 * Světlá karta jednoho bloku detailu zápasu (Branky, Tresty, Statistika,
 * Reportáž) — nadpis `h2` vlevo, volitelný doplněk (součet, počet) vpravo.
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
        <CardTitle as="h2" id={id}>
          {title}
        </CardTitle>
        {aside}
      </div>
      {children}
    </section>
  )
}
