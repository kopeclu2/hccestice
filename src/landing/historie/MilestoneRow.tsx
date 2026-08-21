import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { CardTitle } from '../components/Heading'
import { PhotoTile } from '../components/PhotoTile'
import type { Milestone } from '../types'

/**
 * Polaroid natočení fotek se střídá v rámci éry (handoff: +1.6° / −1.4° / +1.2°).
 * Platí od `lg` — na mobilu i tabletu je fotka přes celou šířku pod textem
 * a natočený plný pruh by vypadal jako chyba.
 */
const TILT = ['lg:rotate-[1.6deg]', 'lg:-rotate-[1.4deg]', 'lg:rotate-[1.2deg]']

/**
 * Řádek timeline: vlevo obří obrysový letopočet, vpravo titulek s textem
 * a volitelná natočená fotka. Na mobilu se letopočet mění na lime pilulku
 * nad textem a fotka jde přes celou šířku.
 *
 * Fotka jde vedle textu až od `lg`. Na tabletu (768px) zbylo po sloupci
 * letopočtu a fotce `w-70` na text jen ~230px, takže se odstavec lámal po
 * třech slovech; pod textem má text plnou šířku sekce. Fixní výška `h-47.5`
 * platí jen na mobilu — v plné šířce tabletu by z fotky byl úzký pruh,
 * proto se od `md` řídí poměrem stran a šířka je zastropovaná na 26rem,
 * aby fotka nenafoukla stránku na dvojnásobek.
 */
export function MilestoneRow({ milestone, index }: { milestone: Milestone; index: number }) {
  return (
    <div className="grid grid-cols-1 items-start gap-y-3 border-b border-line-mid py-8.5 md:grid-cols-[clamp(8.75rem,16vw,13.75rem)_1fr] md:gap-x-[clamp(1.25rem,3vw,3rem)]">
      <div className="relative">
        {/* Obrysový letopočet je dekorativní číselný displej, necháváme beze změny. */}
        <div
          aria-hidden
          className="text-club/45 text-stroke hidden text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em] select-none [-webkit-text-stroke-width:0.15625rem] md:block"
        >
          {milestone.year}
        </div>
        <Badge className="md:hidden" size="sm" variant="lime">
          {milestone.year}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-col gap-y-4 lg:flex-row lg:items-start lg:gap-x-[clamp(1.25rem,3vw,2.5rem)]">
        <div className="min-w-0 flex-1">
          <CardTitle className="leading-[1.15] text-pretty" size="lg">
            {milestone.title}
          </CardTitle>
          <p className="text-dim mt-2.5 max-w-130 text-body leading-[1.65] text-pretty">
            {milestone.text}
          </p>
        </div>

        {milestone.photo && (
          <PhotoTile
            className={cn(
              'rounded-thumb shadow-lift',
              'h-47.5 w-full flex-none md:aspect-3/2 md:h-auto md:max-w-104 lg:aspect-4/3 lg:w-70 lg:max-w-none',
              TILT[index % TILT.length],
            )}
            gradient="none"
            photo={milestone.photo}
            sizes="(max-width: 64rem) 100vw, 17.5rem"
          />
        )}
      </div>
    </div>
  )
}
