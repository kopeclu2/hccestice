'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { navHref } from '../data/navHref'
import type { NavItem } from '../types'

import { PillLink } from './PillLink'

/**
 * Pill odkazy navigace podstránek s aktivním stavem podle aktuální cesty.
 *
 * Aktivní položku určuje `usePathname()`, ne prop od volajícího — jinak by
 * každá stránka musela svou cestu duplikovat a `/aktuality/[slug]` by se
 * bez ručního dosazení neoznačila vůbec. Prefix matching zajistí, že detail
 * článku zvýrazní „Aktuality".
 *
 * Pilulky se zapínají až na `xl` (1280px), ne na `md`. Devět položek
 * navigace potřebuje vedle loga a CTA ~1240px; na 768px i na 1024px se
 * poslední pilulky (včetně té aktivní) schovaly za CTA a zbytek byl
 * dosažitelný jen vodorovným scrollem, o kterém nic nenapovídalo, že
 * existuje. Do `xl` je proto jedinou navigací burger (`NavMobile`) —
 * ustřižený odkaz je horší než odkaz v menu.
 */
export function NavPills({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  const isActive = (item: NavItem): boolean =>
    item.path !== null && (pathname === item.path || pathname.startsWith(`${item.path}/`))

  return (
    <div className="no-scrollbar hidden min-w-0 gap-2 overflow-x-auto xl:flex">
      {items.map((item) => {
        const active = isActive(item)
        return (
          <PillLink
            className={active ? undefined : 'bg-white/60'}
            href={navHref(item, 'subpage')}
            key={item.label}
            size="sm"
            variant={active ? 'dark' : 'outline'}
          >
            {item.label}
          </PillLink>
        )
      })}
    </div>
  )
}
