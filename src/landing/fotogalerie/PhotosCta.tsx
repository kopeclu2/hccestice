import React from 'react'

import { CtaStrip } from '../components/CtaStrip'
import { PillLink } from '../components/PillLink'

/** Tmavý CTA pás „Máš fotky ze zápasu?" pod výpisem galerií. */
export function PhotosCta() {
  return (
    <CtaStrip
      headline="Máš fotky ze zápasu?"
      perex="Pošli nám je — nejlepší přidáme do galerie i na sítě."
    >
      <PillLink href="/#kontakt" variant="lime" withArrow>
        Poslat fotky
      </PillLink>
    </CtaStrip>
  )
}
