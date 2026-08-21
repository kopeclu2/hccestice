import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Čárkovaná trajektorie puku — dekorace systémových stránek (404, údržba).
 *
 * Nepatří do `Decorations.tsx`: ty jsou všechny `absolute -z-1 hidden md:block`
 * na pozadí sekce, zatímco trajektorie v údržbě je normální prvek v toku
 * obsahu, viditelný i na mobilu. Animaci nese token `--animate-puck-trail`.
 */

/** Oblouk s pukem na konci — 404, vpravo pod obřím kódem. */
export function PuckTrailArc({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn('hidden w-[min(25rem,32vw)] overflow-visible md:block', className)}
      viewBox="0 0 400 60"
    >
      <path
        className="animate-puck-trail stroke-club"
        d="M0 40 C 90 40 110 8 200 8 S 320 52 400 30"
        fill="none"
        strokeDasharray="6 8"
        strokeWidth="2"
      />
      <circle className="fill-contrast" cx="400" cy="30" r="9" />
    </svg>
  )
}

/**
 * Vodorovná linka s pukem uprostřed — údržba. Dvě dráhy nad sebou: statická
 * v barvě linek a přes ni animovaná čárkovaná v klubové zelené, takže puk
 * jede po viditelné trase, ne po prázdnu.
 */
export function PuckTrailLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn('w-[min(20rem,70vw)] overflow-visible', className)}
      viewBox="0 0 320 40"
    >
      <path className="stroke-line" d="M0 20 H320" strokeWidth="2" />
      <path
        className="animate-puck-trail-fast stroke-club"
        d="M0 20 H320"
        strokeDasharray="10 14"
        strokeWidth="2"
      />
      <circle className="fill-contrast" cx="160" cy="20" r="8" />
    </svg>
  )
}
