'use client'

import React from 'react'

import type { NavCta, NavItem } from '@/landing/features/navigation/types'
import { cn } from '@/lib/utils'

import { NavCardBar } from './SiteNav'

/** Po kolika pixelech scrollu se lišta zjeví — zhruba půl obrazovky. */
const SCROLL_THRESHOLD = 480

/**
 * Plovoucí navigace po scrollu: stejná bílá karta jako `SiteNav`, jen fixní
 * nahoře okna a skrytá, dokud návštěvník nescrolluje. Statická karta v toku
 * stránky totiž odscrolluje pryč a zbytek (dlouhé) stránky by zůstal bez menu.
 *
 * Žije jednou v root layoutu (`(landing)/layout.tsx`); `context` (home/subpage)
 * si karta odvozuje z `usePathname()`.
 */
export function StickyNav({ items, cta }: { items: NavItem[]; cta: NavCta }) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 top-0 z-30 px-gutter-tight pt-2 transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0',
      )}
      // Skrytá lišta byla jen `opacity-0`/`pointer-events-none` — odkazy uvnitř
      // zůstávaly v tab-pořadí. `inert` je vyřadí z tab-pořadí i z přístupnostního
      // stromu, dokud se lišta po scrollu nezjeví.
      inert={!visible}
    >
      <nav aria-label="Hlavní navigace po scrollu">
        <NavCardBar className="shadow-tile backdrop-blur-lg" cta={cta} items={items} />
      </nav>
    </div>
  )
}
