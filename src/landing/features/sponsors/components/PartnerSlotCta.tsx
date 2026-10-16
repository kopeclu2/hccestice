import Link from 'next/link'
import React from 'react'

import { ButtonArrow, buttonVariants } from '@/components/ui/button'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'

/**
 * Tmavá karta „Volné místo" na konci výpisu partnerů — celá je odkazem
 * na kontakt.
 *
 * Pilulka vpravo je proto `<span>` s třídami přímo z `buttonVariants`
 * (zanořené `<a>` je nevalidní markup) a dekorační „+" je inline element
 * bez negativního z-indexu — `Watermark` má `-z-1` a na tmavém pozadí
 * karty by se skryl pod ním.
 *
 * Na mobilu je karta ve sloupci, ne zalamovaný řádek: pilulka má
 * `whitespace-nowrap`, takže se ve `flex-wrap` na 320px nezalomila pod text,
 * ale vytlačila titulek do pěti řádků vedle sebe.
 */
export function PartnerSlotCta() {
  return (
    <Link
      className="relative flex flex-col items-start gap-y-4 overflow-hidden rounded-tile bg-contrast px-4.5 py-5 text-on-contrast md:flex-row md:flex-nowrap md:items-center md:gap-[clamp(1rem,2.5vw,2rem)] md:px-5.5 md:py-5.5 lg:px-6.5 lg:py-6"
      href="/#kontakt"
    >
      {/* Dekorativní velký znak „+" — necháváme beze změny stejně jako watermarky. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-15 -bottom-11.5 hidden text-watermark-xs leading-none font-extrabold tracking-display text-lime/20 select-none text-stroke md:block"
      >
        +
      </span>

      <div className="relative min-w-0 flex-1">
        <Eyebrow tone="lime" wide>
          Volné místo
        </Eyebrow>
        <CardTitle as="h4" className="mt-1.25" size="sm">
          Tady může být vaše firma
        </CardTitle>
      </div>

      <span className={buttonVariants({ size: 'md', variant: 'lime', withArrow: true })}>
        Ozvěte se nám
        <ButtonArrow size="md" variant="lime" />
      </span>
    </Link>
  )
}
