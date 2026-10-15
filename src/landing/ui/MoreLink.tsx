import React from 'react'

import { PillLink } from './PillLink'

/**
 * Proklik z výřezu sekce na její plnou stránku (home page → /zapasy).
 * Sedí do hlavičky `SectionHead` — pilulka s šipkou vpravo.
 *
 * Velikost `md` (44px) je stejná jako u prokliků Aktualit a Fotoalba: mají
 * tutéž funkci, takže vedle sebe nesmí stát dvě různě vysoké pilulky.
 * Sekundární roli odlišuje varianta `outline`, ne výška.
 */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <PillLink href={href} size="md" variant="outline" withArrow>
      {children}
    </PillLink>
  )
}
