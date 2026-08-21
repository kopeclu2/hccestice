import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Číselný display — skóre, číslo dresu, hodnota statistiky, letopočet.
 *
 * Doplňuje `Heading.tsx`: tohle nejsou nadpisy (nemají sémantiku nadpisu ani
 * `text-wrap`), ale mají stejný nárok na jednu škálu. Komponenta drží velikost,
 * `font-extrabold`, těsný tracking a `tabular-nums`, aby čísla neskákala.
 *
 * Dekorativní obří watermarky (`Watermark.tsx`, `Decorations.tsx`) sem nepatří —
 * ty jsou grafika, ne data.
 */
const numeralVariants = cva('font-extrabold tabular-nums', {
  variants: {
    size: {
      /** Skóre v řádku výsledků — 19px. */
      xs: 'text-numeral-xs tracking-[-0.02em]',
      /** Den v měsíci u mini karty — 22px. */
      sm: 'text-numeral-sm leading-none tracking-[-0.02em]',
      /** Datum v rozpisu zápasů — 26px. */
      md: 'text-numeral-md tracking-[-0.03em]',
      /** Číslo dresu, monogram sponzora — 30px. */
      lg: 'text-numeral-lg tracking-[-0.03em]',
      /** Hodnota ve statistické kartě — 36px. */
      xl: 'text-numeral-xl leading-tight tracking-[-0.03em]',
      /** Skóre karty zápasu, velká statistika sekce — 48px. */
      '2xl': 'text-numeral-2xl leading-none tracking-[-0.04em]',
      /** Skóre v hero zápasu — plynulé, jediný fluidní případ na webu. */
      score: 'text-[clamp(3.5rem,7vw,6.75rem)] leading-none tracking-[-0.04em]',
    },
  },
  defaultVariants: { size: 'md' },
})

export type NumeralProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof numeralVariants> & {
    /** Čísla stojí i v gridových buňkách, kde `<span>` nestačí. */
    as?: 'span' | 'div'
  }

export function Numeral({ children, className, size, as = 'span', ...props }: NumeralProps) {
  const Tag = as
  return (
    <Tag className={cn(numeralVariants({ size }), className)} {...props}>
      {children}
    </Tag>
  )
}
