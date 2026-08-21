import React from 'react'

import { PillLink } from './PillLink'

/**
 * Proklik z výřezu sekce na její plnou stránku (home page → /zapasy).
 * Sedí do hlavičky `SectionHead` — malá pilulka s šipkou vpravo.
 */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <PillLink href={href} size="sm" variant="outline" withArrow>
      {children}
    </PillLink>
  )
}
