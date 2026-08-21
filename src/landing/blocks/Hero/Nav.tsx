import React from 'react'

import { LogoStamp } from '../../components/LogoStamp'
import { NavMobile } from '../../components/NavMobile'
import { PillLink } from '../../components/PillLink'
import { ctaHref, navHref } from '../../data/navigation'
import type { NavCta, NavItem } from '../../types'

/**
 * Navigace plovoucí přes hero fotku: bílá „známka" s logem vlevo,
 * skleněné pill odkazy na kotvy sekcí (od `xl`), CTA vpravo a burger menu,
 * které je do `xl` jedinou úplnou navigací.
 *
 * Položky i CTA přicházejí z CMS; cíl odkazu řeší `navHref` v kontextu
 * `home` (kotva, nebo podstránka u položek bez sekce).
 */
export function LandingNav({ cta, items }: { cta: NavCta; items: NavItem[] }) {
  const href = ctaHref(cta.href, 'home')

  // z-4: hero obsah pod navigací je na mobilu `relative z-3` v toku a se
  // stejným z-indexem by navigaci (a tím i burger) překryl.
  return (
    <nav className="absolute inset-x-[clamp(1.125rem,3vw,2.75rem)] top-6.5 z-4 flex items-center gap-2.5">
      <LogoStamp href="#home" />

      {/* Pilulky až od `xl` — stejná hranice jako `components/NavPills`.
          Devět položek z CMS se vedle loga a CTA vejde až od 1280px; do té
          doby se řada tiše scrollovala (`no-scrollbar`), takže na 768 i 1024
          byla část navigace nedosažitelná a poslední pilulka ustřižená. */}
      <div className="no-scrollbar hidden min-w-0 gap-2 overflow-x-auto xl:flex">
        {items.map((item) => (
          <PillLink href={navHref(item, 'home')} key={item.label} size="sm" variant="glass">
            {item.label}
          </PillLink>
        ))}
      </div>

      <div className="min-w-5 flex-1" />

      <PillLink className="max-md:hidden" href={href} size="md" variant="dark" withArrow>
        {cta.label}
      </PillLink>

      <NavMobile context="home" ctaHref={href} ctaLabel={cta.label} items={items} tone="glass" />
    </nav>
  )
}
