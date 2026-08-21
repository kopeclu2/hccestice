import type { VariantProps } from 'class-variance-authority'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

const cardShellVariants = cva(
  'hover:border-club flex h-full flex-col overflow-hidden rounded-block border border-line-mid bg-surface transition-colors',
  {
    variants: {
      /** Textová karta má padding na obalu, mediální ho má jen kolem fotky. */
      pad: { text: 'px-5 py-4.5', media: 'p-2.5 pb-5' },
    },
    defaultVariants: { pad: 'text' },
  },
)

/**
 * Odkaz, který bez `href` degraduje na `div`.
 *
 * Nepublikovaný slug nesmí vyrobit odkaz nikam. Tenhle `if (!href)` fallback
 * byl zkopírovaný ve dvou mřížkách a potřetí jako lokální kopie v bloku News.
 */
export function MaybeLink({
  children,
  className,
  href,
  label,
}: {
  children: React.ReactNode
  className?: string
  href?: null | string
  /**
   * Přístupný název odkazu, když je jeho jediným obsahem fotka — čtečka by
   * jinak přečetla `alt` obrázku (mozaika Fotoalba má dlaždice bez titulku).
   */
  label?: string
}) {
  if (!href) return <div className={className}>{children}</div>
  return (
    <Link aria-label={label} className={className} href={href}>
      {children}
    </Link>
  )
}

/** Karta výpisu — obal se stylem karty, bez `href` jako `div`. */
export function CardShell({
  children,
  className,
  href,
  pad,
}: {
  children: React.ReactNode
  className?: string
  href?: null | string
} & VariantProps<typeof cardShellVariants>) {
  return (
    <MaybeLink className={cn(cardShellVariants({ pad }), className)} href={href}>
      {children}
    </MaybeLink>
  )
}

/**
 * „Číst článek ↗" na spodní hraně karty.
 *
 * `mt-auto` drží řádek u spodní hrany, aby byl v řádku mřížky zarovnaný
 * i u kratších titulků.
 */
export function CardCta({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'text-club mt-auto flex items-center gap-2 pt-4 text-caption font-bold',
        className,
      )}
    >
      {children}
      <span className="bg-contrast text-lime grid size-5.5 place-items-center rounded-full [&_svg]:size-3">
        <ArrowUpRight strokeWidth={2.5} />
      </span>
    </div>
  )
}

/**
 * Mřížka karet výpisu s prázdným stavem — na mobilu jeden sloupec.
 *
 * Oba výpisy (aktuality, galerie) měly stejný skeleton: stejný prázdný stav,
 * stejnou mřížku a vlastní privátní `*Card` komponentu.
 *
 * Tři sloupce začínají až na `lg` (1024px). Na tabletu (768px) vycházel
 * sloupec na ~230 px, takže titulky článků se lámaly do dvou slov na řádek
 * a delší se stříhaly na `line-clamp` třemi tečkami — ověřeno na `/aktuality`.
 * Druhý sloupec naskakuje už na `sm` (640px, telefon na šířku): jediný
 * sloupec je tam 612px široký, což je u textové karty přes 90 znaků na řádek.
 */
export function CardGrid<T>({
  children,
  className,
  empty,
  items,
}: {
  /** Render jedné karty. Obal řeší `CardShell`. */
  children: (item: T, index: number) => React.ReactNode
  className?: string
  /**
   * Prázdný stav — `EmptyState`, ne text. Volající ho skládá sám, protože
   * jeho znění i cesty dál závisí na tom, jestli je zapnutý filtr (viz
   * `AktualityGrid`, `GalleryGrid`).
   */
  empty: React.ReactNode
  items: T[]
}) {
  if (items.length === 0) return empty

  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item, index) => children(item, index))}
    </div>
  )
}
