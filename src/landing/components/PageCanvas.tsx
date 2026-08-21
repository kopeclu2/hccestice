import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Podklad stránky: `<main>` s gradientem, vodorovným odsazením a šrafovaným
 * pásem pod hlavičkou.
 *
 * Tenhle celý blok si dřív ručně přepisovalo všech devět `(landing)` stránek —
 * maska šrafování byla byte-identická ve všech devíti, gradient v sedmi.
 * Barvy gradientu jsou tokeny; dřív to byl literál `#fff` a `#e9f0eb`
 * (což je `--color-paper-mid` s odchylkou 1/255 na dvou kanálech).
 */
const pageCanvasVariants = cva('text-ink relative overflow-x-clip', {
  variants: {
    /**
     * Svislý gradient podkladu. Zlomy se liší podle výšky obsahu nad prvním
     * paper pásem — proto tři varianty, ne jedna se `className` override.
     */
    surface: {
      /** Podstránky s hlavičkou (aktuality, fotogalerie, zápasy, soupiska, sponzoři, historie). */
      subpage:
        'pt-3.5 [background:linear-gradient(180deg,var(--color-surface)_0,var(--color-surface)_37.5rem,var(--color-paper-mid)_87.5rem,var(--color-chip)_137.5rem,var(--color-paper)_100%)]',
      /** Detail článku — vyšší hero, zlomy o 6.25rem níž. */
      article:
        'pt-3.5 [background:linear-gradient(180deg,var(--color-surface)_0,var(--color-surface)_43.75rem,var(--color-paper-mid)_93.75rem,var(--color-chip)_150rem,var(--color-paper)_100%)]',
      /** Homepage — nejdelší bílý pás nad prvním zlomem. */
      home: 'pt-3.5 [background:linear-gradient(180deg,var(--color-surface)_0,var(--color-surface)_68.75rem,var(--color-paper-mid)_118.75rem,var(--color-chip)_162.5rem,var(--color-paper)_100%)]',
      /** Plochý paper podklad — katalogy /vzory, /widgety, detail produktu. */
      paper: 'bg-paper pb-24',
    },
    /** Vodorovné odsazení stránky. */
    gutter: {
      tight: 'px-[clamp(0.625rem,1.4vw,1.25rem)]',
      wide: 'px-[clamp(0.875rem,3vw,2.5rem)]',
      none: '',
    },
  },
  defaultVariants: { surface: 'subpage', gutter: 'tight' },
})

export type PageCanvasProps = React.ComponentProps<'main'> &
  VariantProps<typeof pageCanvasVariants> & {
    /** Diagonální šrafování v pásu pod hlavičkou (podpis designu). */
    hatch?: boolean
  }

export function PageCanvas({
  children,
  className,
  gutter,
  hatch = true,
  surface,
  ...props
}: PageCanvasProps) {
  return (
    <main className={cn(pageCanvasVariants({ gutter, surface }), className)} {...props}>
      {hatch && (
        <div className="hatch pointer-events-none absolute inset-0 z-0 [mask-image:repeating-linear-gradient(180deg,transparent_0,#000_27.5rem,#000_51.25rem,transparent_78.75rem)]" />
      )}
      {children}
    </main>
  )
}
