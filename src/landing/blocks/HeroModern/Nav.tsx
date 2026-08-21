import React from 'react'

import { cn } from '@/utilities/ui'

import { NavMobile } from '../../components/NavMobile'
import { PillLink } from '../../components/PillLink'
import { ctaHref, navHref } from '../../data/navigation'
import type { NavCta, NavItem } from '../../types'

import { LogoTab } from './LogoTab'

/**
 * Kolik odkazů zůstane v pilulkách pod `2xl` (na každé straně loga).
 *
 * Šířky, které v tom řádku nejde ušetřit: logo uprostřed ~180 px, CTA ~130,
 * burger 40. Devět pilulek z CMS se pod ~1536 px vedle toho nevejde a začnou
 * se sunout pod jazyk s logem. Zbytek proto do `2xl` nese menu pod burgerem
 * — ten je tady vidět na všech šířkách, aby navigace nikdy nebyla neúplná.
 */
const PILLS_PER_SIDE = 2

/**
 * Navigace varianty 2 — odkazy jsou rozdělené na dvě poloviny a obtékají
 * logo zavěšené uprostřed horní hrany fotky.
 *
 * Nosič je grid `1fr auto 1fr`, ne flex: prostřední sloupec je jazyk s logem,
 * takže díru pro něj drží samo layoutování a pilulky pod něj nemají kudy
 * podlézt. Dva stejné `1fr` zároveň drží logo v optickém středu.
 *
 * Pilulky se ukazují od `lg`, v plném počtu od `2xl`; pod `lg` je jedinou
 * navigací burger.
 *
 * z-4 stejně jako u varianty 1: hero obsah je na mobilu `relative z-3`
 * v toku a se stejným z-indexem by burger překryl.
 */
export function HeroModernNav({ cta, items }: { cta: NavCta | null; items: NavItem[] }) {
  // `null` = správce tlačítko v adminu vypnul (`showNavCta`).
  const href = cta ? ctaHref(cta.href, 'home') : null

  // Přebývající položka jde vlevo — tam je víc místa, protože vpravo sedí
  // ještě CTA a burger.
  const split = Math.ceil(items.length / 2)

  return (
    <nav className="absolute inset-x-[clamp(1rem,2.6vw,2.25rem)] top-5 z-4 grid grid-cols-[1fr_auto_1fr] items-start gap-2">
      {/* vlevo se do `2xl` schovávají položky blíž logu, vpravo naopak ty od
          loga — zbylé pilulky tak drží u krajů a kolem loga zůstane vzduch */}
      <NavPills items={items.slice(0, split)} keep="first" />

      {/* -mt-5 ruší `top-5` navigace, aby jazyk lícoval s hranou fotky */}
      <LogoTab className="-mt-5" />

      <div className="flex min-w-0 items-center justify-end gap-2">
        <NavPills className="justify-end" items={items.slice(split)} keep="last" />

        {cta && href && (
          <PillLink className="max-md:hidden" href={href} size="sm" variant="dark" withArrow>
            {cta.label}
          </PillLink>
        )}

        <NavMobile
          always
          context="home"
          ctaHref={href ?? undefined}
          ctaLabel={cta?.label}
          items={items}
          tone="glass"
        />
      </div>
    </nav>
  )
}

/**
 * Jedna polovina odkazů. Obal je v layoutu **vždy** (drží sloupec gridu),
 * skrývá se až řada pilulek uvnitř — `display: none` na položce gridu by ji
 * z auto-placementu vyřadilo a logo by spadlo do prvního sloupce.
 *
 * `keep` říká, který konec řady přežije do `2xl`: u levé poloviny první
 * položky, u pravé poslední.
 */
function NavPills({
  className,
  items,
  keep,
}: {
  className?: string
  items: NavItem[]
  keep: 'first' | 'last'
}) {
  const kept = (index: number) =>
    keep === 'first' ? index < PILLS_PER_SIDE : index >= items.length - PILLS_PER_SIDE

  return (
    <div className="min-w-0">
      <div className={cn('no-scrollbar hidden min-w-0 gap-2 overflow-x-auto lg:flex', className)}>
        {items.map((item, index) => (
          <PillLink
            className={cn(!kept(index) && 'max-2xl:hidden')}
            href={navHref(item, 'home')}
            key={item.label}
            size="sm"
            variant="glass"
          >
            {item.label}
          </PillLink>
        ))}
      </div>
    </div>
  )
}
