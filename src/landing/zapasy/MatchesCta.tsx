import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'

/** Zelený CTA pás „Přijď na zimák fandit." pod výsledky a tabulkou. */
export function MatchesCta() {
  return (
    <CtaStrip
      headline="Přijď na zimák fandit."
      perex="Vstup na domácí zápasy je zdarma. Buben s sebou."
      tone="club"
      watermark="HCČ"
    >
      <PillLink href="/aktuality" variant="lime" withArrow>
        Zápasové reporty
      </PillLink>
    </CtaStrip>
  )
}
