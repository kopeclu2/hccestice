'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { isNavItemActive, navHref } from '@/landing/features/navigation/navHref'
import type { NavItem } from '@/landing/features/navigation/types'

/**
 * Pill odkazy navigace podstránek s aktivním stavem podle aktuální cesty.
 *
 * Aktivní položku určuje `usePathname()`, ne prop od volajícího — jinak by
 * každá stránka musela svou cestu duplikovat a `/aktuality/[slug]` by se
 * bez ručního dosazení neoznačila vůbec. Prefix matching (`isNavItemActive`
 * v `navHref.ts`, sdílený s `NavMobile`) zajistí, že detail článku zvýrazní
 * „Aktuality".
 *
 * Pilulky se zapínají až na `nav` (1440px, vlastní breakpoint v
 * `globals.css`), ne na `md`. Deset položek navigace potřebuje vedle loga
 * a CTA ~1330px (s `gap-1.5`); na 768px i na 1024px se
 * poslední pilulky (včetně té aktivní) schovaly za CTA a zbytek byl
 * dosažitelný jen vodorovným scrollem, o kterém nic nenapovídalo, že
 * existuje. Do `nav` je proto jedinou navigací burger (`NavMobile`) —
 * ustřižený odkaz je horší než odkaz v menu.
 */
export function NavPills({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <div className="no-scrollbar hidden min-w-0 gap-1.5 overflow-x-auto nav:flex">
      {items.map((item) => {
        const active = isNavItemActive(item, pathname)
        return (
          <Button
            asChild
            key={item.label}
            className={active ? undefined : 'bg-on-contrast-subtle'}
            size="sm"
            variant={active ? 'dark' : 'outline'}
          >
            <Link aria-current={active ? 'page' : undefined} href={navHref(item, 'subpage')}>
              {item.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
