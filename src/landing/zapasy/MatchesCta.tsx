import React from 'react'

import { CtaStrip } from '@/landing/ui/CtaStrip'
import { PillLink } from '@/landing/ui/PillLink'

/** Zelený CTA pás „Přijď na zimák fandit." pod výsledky a tabulkou. */
export function MatchesCta() {
  return (
    <CtaStrip
      headline="Přijď na zimák fandit."
      perex="Domácí zápasy hrajeme na zimním stadionu v Rychnově nad Kněžnou. Buben s sebou."
      tone="club"
      watermark="HCČ"
    >
      <PillLink href="/aktuality" variant="light" withArrow>
        Zápasové reporty
      </PillLink>
    </CtaStrip>
  )
}
