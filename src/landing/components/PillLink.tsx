import type { VariantProps } from 'class-variance-authority'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

import { arrowVariants, pillVariants } from './pill'

/**
 * Pill odkaz — základní CTA prvek celého designu.
 * Varianty a velikosti viz `./pill.ts`; tlačítková obdoba je `PillButton`.
 */
export type PillLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof pillVariants> & {
    children: React.ReactNode
    /**
     * Vlastní ikona do kruhu místo šipky ↗ — stejně jako u `PillButton`
     * (prázdné stavy mají „zrušit filtr" s ✕ a „zpět" s →). Vyžaduje
     * `withArrow`, aby kruh vůbec vznikl.
     */
    arrowIcon?: React.ReactNode
  }

export function PillLink({
  children,
  className,
  variant,
  size,
  withArrow,
  selected,
  arrowIcon,
  ...linkProps
}: PillLinkProps) {
  return (
    <Link
      className={cn(pillVariants({ variant, size, withArrow, selected }), className)}
      {...linkProps}
    >
      {children}
      {withArrow && (
        <span aria-hidden className={arrowVariants({ variant, size })}>
          {arrowIcon ?? <ArrowUpRight strokeWidth={2.5} />}
        </span>
      )}
    </Link>
  )
}
