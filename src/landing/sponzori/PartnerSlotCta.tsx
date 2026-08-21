import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { arrowVariants, pillVariants } from '../components/pill'

/**
 * Tmavá karta „Volné místo" na konci výpisu partnerů — celá je odkazem
 * na kontakt.
 *
 * Pilulka vpravo je proto `<span>` s třídami přímo z `pillVariants`
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
      className="bg-contrast rounded-tile relative flex flex-col items-start gap-y-4 overflow-hidden px-6.5 py-5.5 text-on-contrast md:flex-row md:flex-nowrap md:items-center md:gap-[clamp(1rem,2.5vw,2rem)]"
      href="/#kontakt"
    >
      {/* Dekorativní velký znak „+" — necháváme beze změny stejně jako watermarky. */}
      <span
        aria-hidden
        className="text-lime/20 text-stroke pointer-events-none absolute right-15 -bottom-11.5 hidden text-watermark-xs leading-none font-extrabold tracking-[-0.06em] select-none md:block"
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

      <span className={pillVariants({ size: 'md', variant: 'lime', withArrow: true })}>
        Ozvěte se nám
        <span aria-hidden className={arrowVariants({ size: 'md', variant: 'lime' })}>
          <ArrowUpRight strokeWidth={2.5} />
        </span>
      </span>
    </Link>
  )
}
