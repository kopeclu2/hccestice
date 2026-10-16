import Link from 'next/link'
import React from 'react'

import { cn } from '@/lib/utils'

/**
 * „Stretched link" — titulek karty nebo řádku je odkaz, jehož `::after`
 * se roztáhne přes celého předka (`relative`), takže klikatelná je celá
 * plocha, ale v DOM je jediné `<a>`. Žádné vnořené odkazy a čtečka čte jen
 * název zápasu, ne celý řádek.
 *
 * Předek dostane `stretchHost`: `relative` pro ukotvení a viditelný focus
 * ring celé karty. Odkaz sám má `outline-none` — obrys kolem jednoho řádku
 * titulku by na klikací ploše přes celou kartu působil jako chyba.
 * Další klikatelné prvky uvnitř (tlačítka, jiné odkazy) potřebují
 * `relative z-1`, aby jim `::after` nepřebil kliknutí.
 *
 * Bez `href` (zápas bez slugu) se vykreslí jen obsah — tedy přesně jako
 * dřív, bez odkazu.
 */
export const stretchHost =
  'relative has-[[data-stretched]:focus-visible]:outline-2 has-[[data-stretched]:focus-visible]:outline-offset-2 has-[[data-stretched]:focus-visible]:outline-club'

export function StretchedLink({
  href,
  children,
  className,
}: {
  href: string | null
  children: React.ReactNode
  className?: string
}) {
  if (!href) return <>{children}</>

  return (
    <Link
      className={cn(
        "block outline-none after:absolute after:inset-0 after:content-['']",
        className,
      )}
      data-stretched=""
      href={href}
    >
      {children}
    </Link>
  )
}
