import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

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
    <Button asChild size="md" variant="outline" withArrow>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
