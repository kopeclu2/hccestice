import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Hokejový motiv webu: kruh vhazování se středovou tečkou a značkami nahoře
 * a dole; velikost i barvu (`text-*`) nese `className`. Používá se jen jako
 * rám čísla (Historie).
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
