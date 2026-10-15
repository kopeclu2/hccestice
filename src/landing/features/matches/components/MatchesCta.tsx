import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { CtaStrip } from '@/landing/ui/CtaStrip'

/** Zelený CTA pás „Přijď na zimák fandit." pod výsledky a tabulkou. */
export function MatchesCta() {
  return (
    <CtaStrip
      headline="Přijď na zimák fandit."
      perex="Domácí zápasy hrajeme na zimním stadionu v Rychnově nad Kněžnou. Buben s sebou."
      tone="club"
      watermark="HCČ"
    >
      <Button asChild variant="light" withArrow>
        <Link href="/aktuality">Zápasové reporty</Link>
      </Button>
    </CtaStrip>
  )
}
