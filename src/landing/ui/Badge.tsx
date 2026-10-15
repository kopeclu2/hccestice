import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Statická pilulka (badge) — štítky u zápasů, výsledků, karet a milníků.
 *
 * Doplňuje `PillLink` (klikací CTA) a `Kicker` (štítek nad nadpisem):
 * tady jde o neklikací štítek se stejnými poloměry a rozestupy napříč webem.
 *
 * Varianty odpovídají handoffu:
 * - `lime`    — hlavní zvýraznění (skóre, výhra, „Doma", nejnovější milník)
 * - `chip`    — neutrální světlý štítek („Venku", fáze soutěže)
 * - `muted`   — neutrální se ztišeným textem (remíza)
 * - `loss`    — cihlová (prohra)
 * - `split`   — půlený cihlová | světle zelená (prohra po prodloužení /
 *               nájezdech, za kterou je bod)
 * - `club`    — klubová zelená plocha (rozpis: domácí zápas)
 * - `outline` — obrys na světlém pozadí (pilulky milníků)
 */
const badgeVariants = cva('inline-flex items-center rounded-full whitespace-nowrap', {
  variants: {
    variant: {
      lime: 'bg-lime font-bold text-ink',
      chip: 'bg-chip font-bold text-ink',
      muted: 'bg-chip font-bold text-ink-soft',
      loss: 'bg-loss font-bold text-loss-ink',
      split:
        'bg-[linear-gradient(90deg,var(--color-loss)_50%,var(--color-win)_50%)] font-bold text-loss-ink',
      club: 'bg-club font-bold text-on-contrast',
      outline: 'border border-line font-semibold text-ink-soft',
      /** Bílý štítek na tmavé ploše / v zelené kartě. */
      light: 'bg-surface font-bold text-ink',
      /**
       * Průsvitný tmavý štítek přes fotku (počet fotek v galerii, třetiny
       * u výsledku). Musí být čitelný na libovolném snímku, proto blur.
       */
      glass: 'bg-pine-deep/62 font-semibold text-on-contrast backdrop-blur-[0.5rem]',
      /** Obrys na tmavé ploše — protipól `outline`. */
      glassOutline: 'border border-on-contrast-ghost font-semibold text-on-contrast',
    },
    size: {
      /** Drobný štítek v hustých výpisech (11px text). */
      xs: 'px-3 py-1.25 text-eyebrow',
      /** Základní štítek u karet a řádků. */
      sm: 'px-3 py-1.25 text-xs',
      /** Volnější štítek v textových sekcích. */
      md: 'px-4 py-1.75 text-xs',
      /** Štítek v rytmu pilulek (`PillLink size="sm"`) — kontakty, adresy. */
      lg: 'px-4.5 py-2.25 text-sm',
    },
    /**
     * Uppercase varianta (kategorie článku). Prostrkání je jemnější než
     * u `Eyebrow` — badge má vlastní plochu, nepotřebuje ji rozpírat.
     */
    caps: {
      true: 'tracking-[0.04em] uppercase',
      false: '',
    },
  },
  defaultVariants: { variant: 'chip', size: 'sm', caps: false },
})

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ children, className, variant, size, caps, ...spanProps }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, caps }), className)} {...spanProps}>
      {children}
    </span>
  )
}
