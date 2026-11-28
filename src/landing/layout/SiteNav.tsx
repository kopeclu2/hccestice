'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { ctaHref, isNavItemActive, navHref } from '@/landing/features/navigation/navHref'
import type { NavCta, NavItem } from '@/landing/features/navigation/types'
import { CLUB_LOGO_IMAGE, CLUB_NAME } from '@/lib/club'
import { cn } from '@/lib/utils'

import { NavMobile } from './NavMobile'

/**
 * Hlavní navigace jako bílá karta s logem, textovými odkazy a CTA (varianta
 * „karta na papíru“). Leží v toku stránky nad hero, ne přes fotku.
 *
 * Stejná karta je navigací homepage i podstránek (`SiteNav`) a po scrollu
 * i plovoucí lištou (`StickyNav`). Do `nav` (viz `globals.css`) jsou odkazy
 * skryté a navigací je burger (`NavMobile`).
 *
 * `context` se odvozuje z `usePathname()`, aby šla použít v root layoutu bez
 * dynamických API: na homepage vedou odkazy na kotvy, jinde na cesty.
 */
export function NavCardBar({
  items,
  cta,
  className,
}: {
  items: NavItem[]
  /** `null` = správce tlačítko v adminu vypnul (`showNavCta`). */
  cta: NavCta | null
  className?: string
}) {
  const pathname = usePathname()
  const context = pathname === '/' ? 'home' : 'subpage'
  const href = cta ? ctaHref(cta.href, context) : undefined

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-tile border border-line-soft bg-surface py-2.5 pr-2.5 pl-4.5',
        className,
      )}
    >
      <Link
        className="flex flex-none items-center gap-2.5"
        href={context === 'home' ? '#home' : '/'}
      >
        <Image alt="" height={44} src={CLUB_LOGO_IMAGE} width={44} />
        <span className="text-base font-extrabold tracking-widest whitespace-nowrap text-ink">
          {CLUB_NAME.toUpperCase()}
        </span>
      </Link>

      <ul className="no-scrollbar hidden min-w-0 items-center gap-0.5 overflow-x-auto nav:flex">
        {items.map((item) => {
          const active = isNavItemActive(item, pathname)
          return (
            <li key={item.label}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                  active ? 'bg-tint text-club-dark' : 'text-ink-soft hover:bg-chip hover:text-ink',
                )}
                href={navHref(item, context)}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-2">
        {cta && href && (
          <Button asChild className="max-md:hidden" size="sm" variant="dark" withArrow>
            <Link href={href}>{cta.label}</Link>
          </Button>
        )}
        <NavMobile context={context} ctaHref={href} ctaLabel={cta?.label} items={items} />
      </div>
    </div>
  )
}

/** Karta navigace v toku stránky; pod ní nechává mezeru k hero. */
export function SiteNav({ items, cta }: { items: NavItem[]; cta: NavCta | null }) {
  return (
    <nav aria-label="Hlavní navigace" className="relative z-2 mb-3.5">
      <NavCardBar cta={cta} items={items} />
    </nav>
  )
}
