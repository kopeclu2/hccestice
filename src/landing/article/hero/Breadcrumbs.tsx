import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

import { BreadcrumbsJsonLd } from '../../components/BreadcrumbsJsonLd'

/** Barevné ladění drobečků podle podkladu hero varianty. */
export type BreadcrumbTone = 'photo' | 'panel' | 'light'

const linkClass: Record<BreadcrumbTone, string> = {
  photo: 'text-white/85 hover:text-lime',
  panel: 'text-white/75 hover:text-lime',
  light: 'text-club hover:text-club-dark',
}

const currentClass: Record<BreadcrumbTone, string> = {
  photo: 'text-lime',
  panel: 'text-lime',
  light: 'text-club font-bold',
}

/** Drobečková navigace hero: Domů / Aktuality / kategorie článku. */
export function Breadcrumbs({
  badge,
  tone,
  className,
}: {
  /** Aktuální položka — kategorie článku („Zápasy", „Novinky"…). */
  badge: string
  tone: BreadcrumbTone
  className?: string
}) {
  const separator = <span className={tone === 'light' ? 'text-faint/50' : 'text-white/50'}>/</span>

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-caption font-semibold',
        tone === 'light' && 'text-faint',
        className,
      )}
    >
      {/* Strukturovaná data k týmž drobečkům — „Domů" doplňuje emitor sám. */}
      <BreadcrumbsJsonLd trail={[{ href: '/aktuality', label: 'Aktuality' }, { label: badge }]} />
      <Link className={cn('transition-colors', linkClass[tone])} href="/">
        Domů
      </Link>
      {separator}
      <Link className={cn('transition-colors', linkClass[tone])} href="/aktuality">
        Aktuality
      </Link>
      {separator}
      <span className={currentClass[tone]}>{badge}</span>
    </div>
  )
}
