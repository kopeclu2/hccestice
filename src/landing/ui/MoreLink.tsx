import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

/**
 * Šipka → pro odkaz na jinou stránku nebo sekci webu. Šipka ↗ (výchozí
 * `withArrow`) znamená „odchod z webu“ (Facebook, Instagram), takže interní
 * odkazy ji nesmí používat: `arrowIcon={internalArrow}`.
 */
export const internalArrow = <ArrowRight strokeWidth={2.5} />

/**
 * Jediná podoba prokliku „Všechny …“ (aktuality, zápasy, výsledky, fotoalbum,
 * partneři, rozpis) z výřezu sekce na její plnou stránku: tichý textový odkaz
 * se šipkou →, podtržení až na hover a focus. Hlavní akce stránky (CTA,
 * odeslání) zůstává `Button` `dark` / `lime`. Tap target 44 px na dotyku dělá
 * `min-h-11` (plocha, ne písmo), na desktopu se ruší.
 */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      className="group/more inline-flex min-h-11 items-center gap-1.5 rounded-chip text-sm font-bold text-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-club focus-visible:ring-offset-2 focus-visible:outline-none md:min-h-0 md:py-2"
      href={href}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="size-3.5 transition-transform group-hover/more:translate-x-0.5 motion-reduce:transition-none"
        strokeWidth={2.5}
      />
    </Link>
  )
}
