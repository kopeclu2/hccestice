import Link from 'next/link'
import React from 'react'

import { BreadcrumbsJsonLd, type Crumb } from '@/landing/layout/BreadcrumbsJsonLd'
import { cn } from '@/lib/utils'

export type { Crumb }

/**
 * Podklad, na kterém drobečky stojí. `page` jsou hlavičky podstránek
 * (světlé, s odsazením pod sebou); `photo`, `panel` a `light` ladí drobečky
 * v hero článku podle podkladu varianty.
 */
export type BreadcrumbTone = 'page' | 'photo' | 'panel' | 'light'

const linkClass: Record<BreadcrumbTone, string> = {
  page: 'text-club-dark hover:text-club',
  light: 'text-club-dark hover:text-club',
  photo: 'text-white/85 hover:text-lime',
  panel: 'text-white/75 hover:text-lime',
}

const currentClass: Record<BreadcrumbTone, string> = {
  page: 'line-clamp-1 font-semibold text-club-dark',
  light: 'font-semibold text-club-dark',
  photo: 'text-lime',
  panel: 'text-lime',
}

const separatorClass: Record<BreadcrumbTone, string> = {
  page: 'opacity-50',
  light: 'text-faint/50',
  photo: 'text-white/50',
  panel: 'text-white/50',
}

/**
 * Drobečková navigace — sémanticky vždy `nav` + `ol`, vzhled podle `tone`.
 *
 * „Domů" se doplňuje automaticky, volající předává jen zbytek cesty —
 * tím se nedá zapomenout ani napsat jinak. Strukturovaná data
 * (`BreadcrumbList`) vykresluje komponenta sama ze stejného `trail`, takže
 * se viditelné a strojové drobečky nemohou rozejít.
 */
export function Breadcrumbs({
  className,
  tone = 'page',
  trail,
}: {
  className?: string
  tone?: BreadcrumbTone
  trail: Crumb[]
}) {
  const onLight = tone === 'page' || tone === 'light'

  return (
    <nav aria-label="Drobečková navigace" className={cn(tone === 'page' && 'mb-5', className)}>
      <BreadcrumbsJsonLd trail={trail} />
      <ol
        className={cn(
          'm-0 flex list-none items-center gap-2 p-0 text-xs font-medium',
          onLight && 'text-faint',
        )}
      >
        <li>
          <Link className={cn('transition-colors', linkClass[tone])} href="/">
            Domů
          </Link>
        </li>
        {trail.map((crumb, index) => (
          <li className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
            <span aria-hidden className={separatorClass[tone]}>
              /
            </span>
            {crumb.href ? (
              <Link className={cn('transition-colors', linkClass[tone])} href={crumb.href}>
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className={currentClass[tone]}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
