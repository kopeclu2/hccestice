import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Dekorace na pozadí sekcí — „podpis designu" z handoffu:
 * rozmazané barevné kruhy, tečkované mřížky a oblouky.
 *
 * Všechny jsou čistě vizuální (aria-hidden, pointer-events-none),
 * na mobilu skryté (handoff: dekorace nemají soutěžit s obsahem)
 * a pod obsahem sekce (-z-1; sekce má `relative z-1`).
 *
 * Naskakují až od `lg`, stejně jako `Watermark` a ze stejného důvodu: pozice
 * jsou kreslené pro 1440px.
 */

const base = 'pointer-events-none absolute -z-1 hidden select-none lg:block'

/** Rozmazaný barevný kruh (radial gradient). */
export function GlowCircle({
  className,
  tone = 'club',
}: {
  className?: string
  tone?: 'club' | 'lime'
}) {
  return (
    <div
      aria-hidden
      className={cn(
        base,
        'rounded-full',
        tone === 'club'
          ? 'bg-[radial-gradient(circle,--alpha(var(--color-club)/13%),transparent_66%)]'
          : 'bg-[radial-gradient(circle,--alpha(var(--color-lime)/30%),transparent_64%)]',
        className,
      )}
    />
  )
}

/** Tečkovaná mřížka s kruhovou maskou. */
export function DotGrid({
  className,
  maskPosition = '20% 30%',
}: {
  className?: string
  maskPosition?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(base, className)}
      style={{
        backgroundImage:
          'radial-gradient(--alpha(var(--color-club)/20%) 0.09375rem, transparent 0.1rem)',
        backgroundSize: '1.375rem 1.375rem',
        maskImage: `radial-gradient(circle at ${maskPosition}, #000, transparent 72%)`,
      }}
    />
  )
}

/** Tři soustředné oblouky (tenké linky). */
export function ArcLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(base, className)}>
      {['border-club/16', 'border-club/11', 'border-club/7'].map((tone, index) => (
        <div
          className={cn('absolute h-50 w-130 -rotate-8 rounded-[50%] border-t-2', tone)}
          key={index}
          style={{
            right: `${-index * 1.875}rem`,
            top: `${index * 2.25}rem`,
          }}
        />
      ))}
    </div>
  )
}

/** token-check-ignore: velikost dekorativního glyfu, ne text z nadpisové škály */
const PLUS_MARK_CLASS = 'text-club/22 text-[1.75rem] font-extrabold'

/** Osamocené „+" (Klub). */
export function PlusMark({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(base, PLUS_MARK_CLASS, className)}>
      +
    </div>
  )
}
