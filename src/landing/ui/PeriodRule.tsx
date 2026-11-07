import React from 'react'

import { cn } from '@/lib/utils'

/**
 * „Zápisová“ čára: dělič sekcí ve tvaru osy zápisu o třech třetinách
 * (I · II · III), s ryskami na hranicích. Nahrazuje kruhy vhazování — kruh
 * kreslí kluziště, tohle kreslí zápis z utkání, tedy to, o čem web je.
 *
 * Čistě dekorativní: římské číslice nenesou žádný údaj (žádný čas, žádné
 * skóre), proto `aria-hidden`. Serverová komponenta, žádný pohyb a žádný
 * klientský JS; barva je `currentColor` z tokenů (`text-*` v `className`).
 */
const PERIODS = ['I', 'II', 'III'] as const

export function PeriodRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none flex items-center text-club/40 select-none', className)}
    >
      {PERIODS.map((period) => (
        <React.Fragment key={period}>
          <span className="h-4 w-0.5 flex-none rounded-full bg-current" />
          <span className="ml-3 text-eyebrow font-bold tracking-caps-lg text-faint">{period}</span>
          <span className="mx-3 h-0.5 flex-1 rounded-full bg-current opacity-45" />
        </React.Fragment>
      ))}
      <span className="h-4 w-0.5 flex-none rounded-full bg-lime" />
    </div>
  )
}
