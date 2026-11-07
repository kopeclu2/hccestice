import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Hokejový motiv webu: kreslení kluziště. Jediný dekorativní prvek v landingu
 * (nahradil watermarky, záře a oblouky), proto má dvě podoby téhož kresu:
 *
 * - `FaceoffCircle` — kruh vhazování se středovou tečkou a značkami nahoře
 *   a dole; velikost i barvu (`text-*`) nese `className`.
 * - `RinkDivider` — vodorovná čára s kruhem uprostřed (středová čára
 *   kluziště); dělí sekce místo prázdného pruhu.
 *
 * Čisté SVG + CSS, serverová komponenta, bez pohybu (takže
 * `prefers-reduced-motion` nemá co měnit). Barvy jdou přes `currentColor`
 * z tokenů, tah má pevnou šířku (`vector-effect`) bez ohledu na velikost.
 */

/** Kruh vhazování; barva tahu = `currentColor`, středová tečka je lime. */
export function FaceoffCircle({
  className,
  dot = true,
}: {
  className?: string
  /** `false`, když se přes střed kruhu kreslí obsah (číslo), který by tečku zakryl. */
  dot?: boolean
}) {
  return (
    <svg
      aria-hidden
      className={cn('pointer-events-none block select-none', className)}
      fill="none"
      focusable="false"
      viewBox="0 0 200 200"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <circle cx="100" cy="100" r="88" vectorEffect="non-scaling-stroke" />
        <path d="M86 2v14M114 2v14M86 198v-14M114 198v-14" vectorEffect="non-scaling-stroke" />
      </g>
      {dot && <circle className="fill-lime" cx="100" cy="100" r="9" />}
    </svg>
  )
}

/**
 * Středová čára s kruhem. Umísťuje se absolutně do mezery nad sekcí
 * (`SectionShell rink`), nebo samostatně v toku.
 */
export function RinkDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none flex items-center gap-4 text-club/35 select-none',
        className,
      )}
    >
      <span className="h-0.5 flex-1 rounded-full bg-current opacity-45" />
      <FaceoffCircle className="size-12 flex-none md:size-14" />
      <span className="h-0.5 flex-1 rounded-full bg-current opacity-45" />
    </div>
  )
}
