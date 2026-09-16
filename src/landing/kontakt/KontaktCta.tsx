import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'

/**
 * Zelený CTA pás na konci `/kontakt`, stejný vzor jako mají ostatní
 * podstránky (`RosterCta`, `ArchiveCta`…) — stránka dřív končila rovnou
 * formulářem a přímo pod ním patičkou, bez uzavírací sekce.
 */
export function KontaktCta() {
  return (
    <CtaStrip
      headline="Chcete nás vidět v akci?"
      perex="Rozpis a výsledky zápasů aktuální sezóny najdete na jednom místě."
      tone="club"
      watermark="HCČ"
    >
      <PillLink href="/zapasy" variant="light" withArrow>
        Rozpis zápasů
      </PillLink>
    </CtaStrip>
  )
}
