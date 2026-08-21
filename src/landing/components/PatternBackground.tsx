import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Vzory na pozadí sekcí — klubová obdoba shadcnblocks „background pattern".
 *
 * Čisté CSS/SVG vrstvy v barvách design systému (klubová zelená, lime,
 * ink, bílá) s volitelnou fade maskou. Použití: rodič musí být
 * `relative` (vzor se roztáhne přes `absolute inset-0`) a obsah nad
 * vzorem `relative`, aby ležel výš:
 *
 * ```tsx
 * <section className="relative isolate overflow-hidden rounded-card bg-surface">
 *   <PatternBackground variant="grid-dashed" fade="top-right" />
 *   <div className="relative">…obsah…</div>
 * </section>
 * ```
 *
 * Živý přehled všech variant a fade masek: /vzory (interní stránka).
 */

export type PatternVariant =
  'grid' | 'grid-dashed' | 'cross' | 'dots' | 'hatch' | 'circuit' | 'glow' | 'glow-duo' | 'noise'

export type PatternFade =
  | 'none'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export type PatternTone = 'club' | 'lime' | 'ink' | 'white'

const TONE_VAR: Record<PatternTone, string> = {
  club: 'var(--color-club)',
  lime: 'var(--color-lime)',
  ink: 'var(--color-ink)',
  white: 'var(--color-surface)',
}

/**
 * Totéž co `TONE_VAR`, ale rozepsané na RGB složky — výhradně pro `dashedTile`.
 *
 * `data:image/svg+xml` je samostatný dokument: nevidí custom properties
 * hostitelské stránky, takže `var(--color-club)` ani `currentColor` se v něm
 * neresolvuje. Jediné alternativy by byly přepsat čárkovanou mřížku na
 * `repeating-linear-gradient` (CSS neumí čárkovat 1px linku ve dvou osách)
 * nebo použít SVG jako `mask-image` — a maska je tu už zabraná propem `fade`.
 *
 * token-check-ignore: data-URI SVG nemá přístup k CSS proměnným
 */
const TONE_RGB: Record<PatternTone, string> = {
  club: '23, 112, 58',
  lime: '201, 242, 77',
  ink: '15, 21, 18',
  white: '255, 255, 255',
}

const FADE_MASK: Record<PatternFade, string | undefined> = {
  none: undefined,
  center: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 25%, transparent 78%)',
  top: 'linear-gradient(180deg, #000 15%, transparent 78%)',
  bottom: 'linear-gradient(0deg, #000 15%, transparent 78%)',
  left: 'linear-gradient(90deg, #000 15%, transparent 78%)',
  right: 'linear-gradient(270deg, #000 15%, transparent 78%)',
  'top-left': 'radial-gradient(circle at 0% 0%, #000 15%, transparent 68%)',
  'top-right': 'radial-gradient(circle at 100% 0%, #000 15%, transparent 68%)',
  'bottom-left': 'radial-gradient(circle at 0% 100%, #000 15%, transparent 68%)',
  'bottom-right': 'radial-gradient(circle at 100% 100%, #000 15%, transparent 68%)',
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** Čárkovaná mřížka jako SVG dlaždice (CSS neumí čárkované gradienty). */
const dashedTile = (rgb: string, alpha: number) =>
  svgUrl(
    // token-check-ignore: data-URI SVG nevidí CSS proměnné, viz TONE_RGB výš
    `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M56 .5H.5V56' fill='none' stroke='rgba(${rgb}, ${alpha})' stroke-dasharray='6 10'/></svg>`,
  )

/** Zrno (feTurbulence) — jemný filmový šum, síla daná opacity v SVG. */
const noiseTile = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>`,
)

/** CSS vrstvy jednotlivých vzorů (background-image/size/position). */
function buildLayer(variant: PatternVariant, tone: PatternTone): React.CSSProperties {
  const line = (alpha: number) =>
    `color-mix(in oklab, ${TONE_VAR[tone]} ${alpha * 100}%, transparent)`

  switch (variant) {
    case 'grid':
      return {
        backgroundImage: `linear-gradient(90deg, ${line(0.1)} 1px, transparent 1px), linear-gradient(180deg, ${line(0.1)} 1px, transparent 1px)`,
        backgroundSize: '3.5rem 3.5rem',
      }
    case 'grid-dashed':
      return {
        backgroundImage: dashedTile(TONE_RGB[tone], 0.16),
        backgroundSize: '3.5rem 3.5rem',
      }
    case 'cross':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${line(0.09)} 0 1px, transparent 1px 2.5rem), repeating-linear-gradient(-45deg, ${line(0.09)} 0 1px, transparent 1px 2.5rem)`,
      }
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${line(0.22)} 0.09375rem, transparent 0.1rem)`,
        backgroundSize: '1.375rem 1.375rem',
      }
    case 'hatch':
      return {
        backgroundImage: `repeating-linear-gradient(115deg, ${line(0.08)} 0 1px, transparent 1px 1.625rem)`,
      }
    case 'circuit':
      return {
        backgroundImage: `radial-gradient(${line(0.28)} 0.125rem, transparent 0.15rem), linear-gradient(90deg, ${line(0.09)} 1px, transparent 1px), linear-gradient(180deg, ${line(0.09)} 1px, transparent 1px)`,
        backgroundSize: '3.5rem 3.5rem',
      }
    case 'glow':
      return {
        backgroundImage: `radial-gradient(ellipse 60% 45% at 50% 0%, ${line(0.16)}, transparent 70%)`,
      }
    case 'glow-duo':
      return {
        backgroundImage: `radial-gradient(circle at 8% 0%, ${line(0.14)}, transparent 45%), radial-gradient(circle at 96% 90%, color-mix(in oklab, ${TONE_VAR.lime} 22%, transparent), transparent 40%)`,
      }
    case 'noise':
      return {
        backgroundImage: `${noiseTile}, radial-gradient(ellipse 70% 55% at 50% 0%, ${line(0.12)}, transparent 72%)`,
      }
  }
}

/** Vrstva vzoru přes celou plochu rodiče (`absolute inset-0`). */
export function PatternBackground({
  variant,
  fade = 'none',
  tone = 'club',
  className,
}: {
  variant: PatternVariant
  /** Směr vytracení vzoru (mask-image); `none` = plná plocha. */
  fade?: PatternFade
  /** Barva vzoru; `white`/`lime` pro tmavé plochy (ink, club panel). */
  tone?: PatternTone
  className?: string
}) {
  const mask = FADE_MASK[fade]
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{ ...buildLayer(variant, tone), maskImage: mask, WebkitMaskImage: mask }}
    />
  )
}
