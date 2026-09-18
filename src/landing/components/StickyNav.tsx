'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/utilities/ui'

import { ctaHref } from '../data/navHref'
import type { NavCta, NavItem } from '../types'

import { LogoStamp } from './LogoStamp'
import { NavMobile } from './NavMobile'
import { NavPills } from './NavPills'
import { PillLink } from './PillLink'

/** Po kolika pixelech scrollu se lišta zjeví — zhruba půl obrazovky. */
const SCROLL_THRESHOLD = 480

/**
 * Kompaktní světlá navigace, fixní nahoře stránky, skrytá dokud
 * návštěvník nescrolluje. Doplňuje dva existující, ale nedostačující
 * zdroje navigace:
 *
 * - plovoucí `LandingNav` v Hero fotce (homepage) — je jen `absolute`
 *   uvnitř bloku Hero, po scrollu pryč z fotky mizí úplně.
 * - statická `ArticleNav` podstránek — scrolluje pryč s obsahem, není
 *   `sticky`.
 *
 * Bez týhle lišty tak návštěvník na zbytku (dlouhé) stránky nemá až do
 * patičky žádné menu — viz `AGENTS.md`, sekce „Známé mezery".
 *
 * `context` (home/subpage) se odvozuje z `usePathname()`, ne z propu —
 * lišta žije jednou v root layoutu (`(landing)/layout.tsx`), ne na
 * každé stránce zvlášť.
 */
export function StickyNav({ items, cta }: { items: NavItem[]; cta: NavCta }) {
  const pathname = usePathname()
  const context = pathname === '/' ? 'home' : 'subpage'
  const href = ctaHref(cta.href, context)

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
        'border-line fixed inset-x-0 top-0 z-30 border-b bg-surface/95 shadow-tile backdrop-blur-lg transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0',
      )}
      // Skrytá lišta byla jen `opacity-0`/`pointer-events-none` — vizuálně
      // zmizí, ale odkazy uvnitř zůstávaly v tab-pořadí. Klávesnicoví
      // uživatelé tak před viditelným obsahem procházeli přes neviditelné
      // logo, pilulky a CTA. `inert` je vyřadí z tab-pořadí i z přístupnostního
      // stromu úplně, dokud se lišta po scrollu nezjeví.
      inert={!visible}
    >
      <nav className="mx-auto flex max-w-[97.5rem] items-center gap-2.5 px-[clamp(0.875rem,3vw,2.5rem)] py-2.5">
        <LogoStamp bordered href={context === 'home' ? '#home' : '/'} />

        <NavPills items={items} />

        <div className="min-w-5 flex-1" />

        <PillLink className="max-md:hidden" href={href} size="md" variant="dark" withArrow>
          {cta.label}
        </PillLink>

        <NavMobile context={context} ctaHref={href} ctaLabel={cta.label} items={items} />
      </nav>
    </div>
  )
}
