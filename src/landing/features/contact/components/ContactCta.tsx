import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { CtaStrip } from '@/landing/ui/CtaStrip'
import { routes } from '@/lib/routes'

/**
 * Zelený CTA pás na konci `/kontakt`, stejný vzor jako mají ostatní
 * podstránky (`RosterCta`, `ArchiveCta`…) — stránka dřív končila rovnou
 * formulářem a přímo pod ním patičkou, bez uzavírací sekce.
 */
export function ContactCta() {
  return (
    <CtaStrip
      headline="Chceš nás vidět v akci?"
      perex="Rozpis a výsledky zápasů aktuální sezóny najdete na jednom místě."
      tone="club"
      watermark="HCČ"
    >
      <Button asChild variant="light" withArrow>
        <Link href={routes.list.matches}>Rozpis zápasů</Link>
      </Button>
    </CtaStrip>
  )
}
