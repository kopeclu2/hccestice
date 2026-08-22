import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import type { Photo } from '../types'

import { Badge } from './Badge'

/**
 * Fotokarta — zaoblený kontejner s fotkou přes celou plochu,
 * tmavým gradientem odspodu a libovolnými overlay prvky (children).
 *
 * `photo` je view-model `Photo` (viz `queries.ts`); když chybí
 * (v adminu není vybraná fotka), vykreslí se jen tmavě zelený
 * podklad, aby layout držel tvar.
 */
export function PhotoTile({
  photo,
  className,
  gradient = 'bottom',
  sizes = '(max-width: 48rem) 100vw, 50vw',
  priority = false,
  children,
}: {
  photo: Photo | null
  className?: string
  /**
   * Směr ztmavení: `bottom` pod textem dole, `bottom-soft` totéž jemněji
   * (nižší dlaždice mozaiky), `full` hero varianta, `none`.
   */
  gradient?: 'bottom' | 'bottom-soft' | 'full' | 'none'
  /** `sizes` pro next/image podle šířky dlaždice v layoutu. */
  sizes?: string
  priority?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={cn('bg-pine relative overflow-hidden rounded-tile', className)}>
      {photo && (
        <Image
          alt={photo.alt}
          className="object-cover"
          fill
          /* `priority` je v Next 16 deprecated a nenastavuje
             `fetchpriority` — u hero fotky (LCP element homepage) proto
             podle dokumentace `loading="eager"` + `fetchPriority="high"`. */
          fetchPriority={priority ? 'high' : undefined}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
          src={getMediaUrl(photo.url)}
        />
      )}
      {gradient === 'bottom' && (
        <div className="from-pine-deep/0 to-pine-deep/80 pointer-events-none absolute inset-0 bg-linear-to-b from-40%" />
      )}
      {gradient === 'bottom-soft' && (
        /* Široká dlaždice mozaiky je o polovinu nižší než velká, takže `bottom`
           by na ní ztmavil skoro celou fotku — handoff tu má nástup později
           a slabší konec. */
        <div className="from-pine-deep/0 to-pine-deep/66 pointer-events-none absolute inset-0 bg-linear-to-b from-55%" />
      )}
      {gradient === 'full' && (
        <>
          {/* zelený klubový filtr + svislé ztmavení nahoře a dole (hero) */}
          <div className="pointer-events-none absolute inset-0 mix-blend-multiply [background:linear-gradient(160deg,--alpha(var(--color-club)/40%),--alpha(var(--color-club-dark)/24%)_55%,--alpha(var(--color-pine-deep)/22%))]" />
          <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,--alpha(var(--color-pine-deep)/50%)_0_18%,--alpha(var(--color-pine-deep)/4%)_42%,--alpha(var(--color-pine-deep)/62%)_72%,--alpha(var(--color-pine-deep)/93%))]" />
        </>
      )}
      {children}
    </div>
  )
}

/**
 * Kruhová šipka ↗ v rohu fotokarty — vizuální signál, že celá dlaždice je
 * odkaz (mozaika Fotoalba).
 *
 * Nepoužívá `arrowVariants` z `./pill.ts`: ten je odvozený od výšek pilulek
 * (největší kruh má 28 px) a jeho barvy jsou vázané na variantu pilulky.
 * Tady jsou průměry 38 a 32 px z handoffu a plocha je vždy bílá.
 */
export function TileArrow({ className, size = 'lg' }: { className?: string; size?: 'lg' | 'sm' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'text-ink group-hover:bg-lime absolute grid place-items-center rounded-full bg-white transition-colors',
        size === 'lg' ? 'size-9.5 [&_svg]:size-4' : 'size-8 [&_svg]:size-3.5',
        className,
      )}
    >
      <ArrowUpRight strokeWidth={2.5} />
    </span>
  )
}

/** Světlý štítek v rohu fotokarty (datum, kategorie). */
export function TileBadge({
  children,
  tone = 'white',
  className,
}: {
  children: React.ReactNode
  tone?: 'white' | 'lime'
  className?: string
}) {
  return (
    <Badge
      className={cn('absolute', tone === 'white' && 'bg-white/92 font-bold', className)}
      size={tone === 'white' ? 'xs' : 'sm'}
      variant={tone === 'white' ? 'chip' : 'lime'}
    >
      {children}
    </Badge>
  )
}
