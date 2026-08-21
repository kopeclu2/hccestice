import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

export type Crumb = {
  label: string
  /** Bez `href` je položka poslední (aktuální stránka) — vykreslí se jako text. */
  href?: string
}

/**
 * Drobečková navigace hlaviček podstránek.
 *
 * „Domů" se doplňuje automaticky, volající předává jen zbytek cesty —
 * tím se nedá zapomenout ani napsat jinak. Tenhle blok byl dřív
 * zkopírovaný v sedmi hlavičkách, se stejnou class stringem znak po znaku.
 */
export function Breadcrumbs({ className, trail }: { className?: string; trail: Crumb[] }) {
  return (
    <div
      className={cn(
        'text-faint mb-5 flex items-center gap-2 text-caption font-semibold',
        className,
      )}
    >
      <Link className="text-club hover:text-club-dark transition-colors" href="/">
        Domů
      </Link>
      {trail.map((crumb, index) => (
        <React.Fragment key={`${crumb.label}-${index}`}>
          <span className="opacity-50">/</span>
          {crumb.href ? (
            <Link className="text-club hover:text-club-dark transition-colors" href={crumb.href}>
              {crumb.label}
            </Link>
          ) : (
            <span className="text-club line-clamp-1 font-bold">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
