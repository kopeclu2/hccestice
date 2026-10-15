import Link from 'next/link'
import React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Zkrácený výpis čísel stran: první, poslední a aktuální ±1, mezery jako „…". */
const pageItems = (page: number, totalPages: number): Array<number | '…'> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const shown = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b)

  const items: Array<number | '…'> = []
  let prev = 0
  for (const n of shown) {
    if (n - prev > 1) items.push('…')
    items.push(n)
    prev = n
  }
  return items
}

/**
 * Stránkování výpisu (aktuality, fotogalerie) — obyčejné odkazy, stav žije
 * v URL; volající dodá `hrefFor` s vlastními parametry (filtr, kotva).
 *
 * `variant="compact"` (výsledky na /zapasy) vynechá čísla stran i dělicí
 * linku — zůstane jen „Strana X z Y" a dvojice šipek.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  variant = 'default',
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
  variant?: 'default' | 'compact'
}) {
  const compact = variant === 'compact'

  return (
    <div
      className={cn(
        // Na mobilu popisek nad ovládáním, od `sm` (640px) jeden řádek s
        // rozpěrkou. Dokud byl řádek jen `flex-wrap`, zalomil se na úzkém
        // displeji uprostřed skupiny tlačítek a `flex-1` rozpěrka odsunula
        // zbytek na druhý řádek doleva — stránkování se rozpadlo na dva
        // nesouvisející bloky (ověřeno na /aktuality při 320px).
        'flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2',
        compact ? 'mt-4' : 'mt-11 border-t border-line-mid pt-7',
      )}
    >
      <span className="text-sm font-medium text-faint">
        Strana {page} z {totalPages}
      </span>
      <div className="hidden flex-1 sm:block" />

      {/* Tlačítka drží pohromadě jako jedna skupina; zalomit se smí jen v ní. */}
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Button asChild className="bg-surface" size="circle" variant="outline">
            <Link aria-label="Předchozí strana" href={hrefFor(page - 1)}>
              ←
            </Link>
          </Button>
        ) : (
          <span
            aria-hidden
            className={cn(
              buttonVariants({ size: 'circle', variant: 'outline' }),
              'bg-surface text-inactive',
            )}
          >
            ←
          </span>
        )}

        {(compact ? [] : pageItems(page, totalPages)).map((item, index) =>
          item === '…' ? (
            <span className="px-1 text-sm font-semibold text-faint" key={`gap-${index}`}>
              …
            </span>
          ) : item === page ? (
            <span
              aria-current="page"
              className={cn(
                buttonVariants({ size: 'circle', variant: 'lime' }),
                'border border-lime',
              )}
              key={item}
            >
              {item}
            </span>
          ) : (
            <Button asChild className="bg-surface" key={item} size="circle" variant="outline">
              <Link href={hrefFor(item)}>{item}</Link>
            </Button>
          ),
        )}

        {page < totalPages ? (
          <Button asChild className="text-lime" size="circle" variant="dark">
            <Link aria-label="Další strana" href={hrefFor(page + 1)}>
              →
            </Link>
          </Button>
        ) : (
          /* Neaktivní „další strana" má stejný ztišený outline jako neaktivní
             „předchozí" — v tmavé variantě vypadala jako hlavní akce stránky,
             přitom nikam nevede. */
          <span
            aria-hidden
            className={cn(
              buttonVariants({ size: 'circle', variant: 'outline' }),
              'bg-surface text-inactive',
            )}
          >
            →
          </span>
        )}
      </div>
    </div>
  )
}
