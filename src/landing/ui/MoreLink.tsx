import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

/**
 * Šipka → pro odkaz na jinou stránku nebo sekci webu. Šipka ↗ (výchozí
 * `withArrow`) znamená „odchod z webu“ (Facebook, Instagram), takže interní
 * odkazy ji nesmí používat: `arrowIcon={internalArrow}`.
 */
export const internalArrow = <ArrowRight strokeWidth={2.5} />

/**
 * Jediná podoba prokliku „Všechny …“ (aktuality, zápasy, výsledky, fotoalbum,
 * partneři, rozpis) z výřezu sekce na její plnou stránku: obrysová pilulka
 * `outline`, velikost `md` (44px), šipka →. Sekundární role je dána obrysem —
 * hlavní akce stránky (CTA, odeslání) zůstává `dark` / `lime`.
 */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button arrowIcon={internalArrow} asChild size="md" variant="outline" withArrow>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
