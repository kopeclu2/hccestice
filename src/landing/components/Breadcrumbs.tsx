import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

import { BreadcrumbsJsonLd } from './BreadcrumbsJsonLd'

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
    <nav aria-label="Drobečková navigace" className={cn('mb-5', className)}>
      <BreadcrumbsJsonLd trail={trail} />
      <ol className="text-faint m-0 flex list-none items-center gap-2 p-0 text-caption font-semibold">
        <li>
          <Link className="text-club-dark hover:text-club transition-colors" href="/">
            Domů
          </Link>
        </li>
        {trail.map((crumb, index) => (
          <li className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
            <span aria-hidden className="opacity-50">
              /
            </span>
            {crumb.href ? (
              <Link
                className="text-club-dark hover:text-club transition-colors"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-club-dark line-clamp-1 font-bold">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
