'use client'

import type { VariantProps } from 'class-variance-authority'

import { ArrowUpRight } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

import { arrowVariants, pillVariants } from './pill'

/**
 * Tlačítková obdoba `PillLink` — filtry, přepínače, odeslání formuláře,
 * cokoli, co nikam nenaviguje. Sdílí varianty přes `./pill.ts`, takže
 * pilulka-odkaz a pilulka-tlačítko vypadají identicky.
 */
export type PillButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof pillVariants> & {
    children: React.ReactNode
    /**
     * Vlastní ikona do kruhu místo šipky ↗ — odesílací tlačítko během
     * requestu ukazuje spinner. Vyžaduje `withArrow`, aby kruh vůbec vznikl.
     */
    arrowIcon?: React.ReactNode
  }

export function PillButton({
  children,
  className,
  variant,
  size,
  withArrow,
  selected,
  arrowIcon,
  type = 'button',
  ...buttonProps
}: PillButtonProps) {
  return (
    <button
      className={cn(
        pillVariants({ variant, size, withArrow, selected }),
        'disabled:pointer-events-none disabled:opacity-45',
        className,
      )}
      type={type}
      {...buttonProps}
    >
      {children}
      {withArrow && (
        <span aria-hidden className={arrowVariants({ variant, size })}>
          {arrowIcon ?? <ArrowUpRight strokeWidth={2.5} />}
        </span>
      )}
    </button>
  )
}
