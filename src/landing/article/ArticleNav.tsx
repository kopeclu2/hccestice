import React from 'react'

import { LogoStamp } from '../components/LogoStamp'
import { NavMobile } from '../components/NavMobile'
import { NavPills } from '../components/NavPills'
import { PillLink } from '../components/PillLink'
import { ctaHref, fetchNavCta, fetchNavigation } from '../data/navigation'

/**
 * Světlá globální navigace podstránek: logo známka vlevo, pill odkazy
 * (jen desktop), CTA vpravo a pod `md` burger menu. Odkazy vedou na
 * podstránky, položky bez podstránky na kotvy homepage.
 *
 * Aktivní stav si řeší `NavPills` z `usePathname()`, takže volající
 * nemusí předávat nic a nelze ho nikde zapomenout.
 */
export async function ArticleNav() {
  const [items, cta] = await Promise.all([fetchNavigation(), fetchNavCta()])
  const href = ctaHref(cta.href, 'subpage')

  return (
    <nav className="relative z-2 mx-auto flex max-w-[97.5rem] items-center gap-2.5 px-[clamp(0.5rem,2vw,1.5rem)] py-2">
      <LogoStamp bordered href="/" />

      <NavPills items={items} />

      <div className="min-w-5 flex-1" />

      <PillLink className="max-md:hidden" href={href} size="md" variant="dark" withArrow>
        {cta.label}
      </PillLink>

      <NavMobile context="subpage" ctaHref={href} ctaLabel={cta.label} items={items} />
    </nav>
  )
}
