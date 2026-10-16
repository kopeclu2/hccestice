import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { ctaHref, fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'
import { NavMobile } from '@/landing/layout/NavMobile'
import { NavPills } from '@/landing/layout/NavPills'
import { LogoStamp } from '@/landing/ui/LogoStamp'

/**
 * Světlá globální navigace podstránek: logo známka vlevo, pilulky odkazů
 * od `xl`, CTA vpravo a burger menu do `xl`. Hranice je `xl` (1280px), ne
 * `md` — proč, vysvětluje komentář v `NavPills.tsx`. Odkazy vedou na
 * podstránky, položky bez podstránky na kotvy homepage.
 *
 * Aktivní stav si řeší `NavPills` i `NavMobile` samy z `usePathname()`
 * (sdíleným predikátem `isNavItemActive`), takže volající nemusí předávat
 * nic a nelze ho nikde zapomenout.
 */
export async function ArticleNav() {
  const [items, cta] = await Promise.all([fetchNavigation(), fetchNavCta()])
  const href = ctaHref(cta.href, 'subpage')

  return (
    <nav className="relative z-2 mx-auto flex max-w-page items-center gap-2.5 px-gutter-nav py-2">
      <LogoStamp bordered href="/" />

      <NavPills items={items} />

      <div className="min-w-5 flex-1" />

      <Button asChild className="max-md:hidden" size="md" variant="dark" withArrow>
        <Link href={href}>{cta.label}</Link>
      </Button>

      <NavMobile context="subpage" ctaHref={href} ctaLabel={cta.label} items={items} />
    </nav>
  )
}
