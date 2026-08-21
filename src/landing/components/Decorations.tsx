import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Dekorace na pozadí sekcí — „podpis designu" z handoffu:
 * SVG siluety hokejky a puku, rozmazané barevné kruhy, tečkované
 * mřížky, oblouky, řada trojúhelníků a rohové závorky.
 *
 * Všechny jsou čistě vizuální (aria-hidden, pointer-events-none),
 * na mobilu skryté (handoff: dekorace nemají soutěžit s obsahem)
 * a pod obsahem sekce (-z-1; sekce má `relative z-1`).
 */

const base = 'pointer-events-none absolute -z-1 hidden select-none md:block'

/** Silueta hokejky (obrys, klubová zelená). */
export function HockeyStick({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(base, className)}>
      <svg
        className="stroke-club/18"
        fill="none"
        height="340"
        strokeLinejoin="round"
        strokeWidth="0.7"
        viewBox="0 0 100 100"
        width="340"
      >
        <path d="M85 1 L42 61 Q40 63 36 63 L13 63 Q8 63 8 69.5 Q8 76 13 76 L42 76 Q49 76 53 70 L91 6 Q93 3 90 1.5 Q87 0.2 85 1 Z" />
        <path d="M13 69.5 L36 69.5" strokeWidth="0.45" />
      </svg>
    </div>
  )
}

/** Silueta puku (obrys, klubová zelená). */
export function Puck({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(base, className)}>
      <svg
        className="stroke-club/15"
        fill="none"
        height="127"
        strokeLinecap="round"
        strokeWidth="0.9"
        viewBox="0 0 100 55"
        width="230"
      >
        <ellipse cx="50" cy="18" rx="40" ry="14" />
        <path d="M10 18 L10 36 Q10 50 50 50 Q90 50 90 36 L90 18" />
      </svg>
    </div>
  )
}

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

/** Čtyři rohové závorky kolem sekce (Fotoalbum). */
export function CornerBrackets({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn(base, 'inset-0', className)}>
      <span className="border-club/22 absolute -left-1.5 top-1.5 size-16 border-l-3 border-t-3" />
      <span className="border-club/22 absolute -right-1.5 top-1.5 size-16 border-r-3 border-t-3" />
      <span className="border-club/14 absolute -left-1.5 bottom-1.5 size-16 border-b-3 border-l-3" />
      <span className="border-club/14 absolute -right-1.5 bottom-1.5 size-16 border-b-3 border-r-3" />
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
