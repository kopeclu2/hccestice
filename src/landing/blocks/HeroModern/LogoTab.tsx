import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Logo klubu jako bílý „jazyk" zavěšený uprostřed horní hrany hero fotky —
 * podpis varianty 2 (handoff `design_header/HC Cestice Modern.dc.html`).
 *
 * Tvar nese SVG, ne `border-radius`: jde o trapéz se zaoblenými rohy
 * a s převisy do stran (`-9` a `209` v `viewBox`), aby horní hrana lícovala
 * s okrajem fotky i po zaoblení. `preserveAspectRatio="none"` je tu záměr —
 * šířka jazyka se řídí obsahem (logo + název), výška je fixní.
 *
 * Jazyk stojí **v toku** navigace (prostřední sloupec gridu), ne absolutně:
 * jinak by pod něj podlézaly pilulky odkazů. Na hranu fotky ho vytáhne
 * negativní `margin-top`, který ruší odsazení navigace.
 */
export function LogoTab({ className, href = '#home' }: { className?: string; href?: string }) {
  return (
    <Link
      className={cn(
        'group relative z-5 flex flex-none flex-col items-center gap-0.75 px-11.5 pt-2.75 pb-3.25',
        className,
      )}
      href={href}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-[calc(100%+1px)] w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 200 60"
      >
        <path
          className="fill-surface"
          d="M-9 0 L209 0 Q200 0 196.8 7.3 L178.3 50 Q174 60 164 60 L36 60 Q26 60 21.7 50 L3.2 7.3 Q0 0 -9 0 Z"
        />
      </svg>
      <Image alt="HC Čestice" className="relative" height={32} src="/logo-cestice.png" width={32} />
      <span className="text-caption group-hover:text-club relative font-extrabold tracking-[0.1em] whitespace-nowrap transition-colors">
        HC ČESTICE
      </span>
    </Link>
  )
}
