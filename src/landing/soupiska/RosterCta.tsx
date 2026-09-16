import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'

/** Zelený CTA pás „Chybíš nám tady ty." pod soupiskou. */
export function RosterCta() {
  return (
    <CtaStrip
      headline="Chybíš nám tady ty."
      perex="Nemusíš mít za sebou žákovskou ligu. Přijď v úterý na trénink."
      tone="club"
      watermark="HCČ"
    >
      <PillLink href="/#kontakt" variant="lime" withArrow>
        Chci hrát
      </PillLink>
    </CtaStrip>
  )
}
