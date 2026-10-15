import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { CtaStrip } from '@/landing/ui/CtaStrip'

/** Zelený CTA pás „Chybíš nám tady ty." pod soupiskou. */
export function RosterCta() {
  return (
    <CtaStrip
      headline="Chybíš nám tady ty."
      perex="Nemusíš mít za sebou žákovskou ligu. Přijď v úterý na trénink."
      tone="club"
      watermark="HCČ"
    >
      <Button asChild variant="lime" withArrow>
        <Link href="/#kontakt">Chci hrát</Link>
      </Button>
    </CtaStrip>
  )
}
