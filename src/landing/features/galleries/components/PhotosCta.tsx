import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { CtaStrip } from '@/landing/ui/CtaStrip'

/** Tmavý CTA pás „Máš fotky ze zápasu?" pod výpisem galerií. */
export function PhotosCta() {
  return (
    <CtaStrip
      headline="Máš fotky ze zápasu?"
      perex="Pošli nám je — nejlepší přidáme do galerie i na sítě."
    >
      <Button asChild variant="lime" withArrow>
        <Link href="/#kontakt">Poslat fotky</Link>
      </Button>
    </CtaStrip>
  )
}
