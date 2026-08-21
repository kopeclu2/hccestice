import React from 'react'

import { cn } from '@/utilities/ui'

import { pillVariants } from './pill'
import { PillLink } from './PillLink'

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
      <span className="text-faint text-meta font-semibold">
        Strana {page} z {totalPages}
      </span>
      <div className="hidden flex-1 sm:block" />

      {/* Tlačítka drží pohromadě jako jedna skupina; zalomit se smí jen v ní. */}
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <PillLink
            aria-label="Předchozí strana"
            className="bg-surface"
            href={hrefFor(page - 1)}
            size="circle"
            variant="outline"
          >
            ←
          </PillLink>
        ) : (
          <span
            aria-hidden
            className={cn(
              pillVariants({ size: 'circle', variant: 'outline' }),
              'bg-surface text-inactive',
            )}
          >
            ←
          </span>
        )}

        {(compact ? [] : pageItems(page, totalPages)).map((item, index) =>
          item === '…' ? (
            <span className="text-faint px-1 text-meta font-bold" key={`gap-${index}`}>
              …
            </span>
          ) : item === page ? (
            <span
              aria-current="page"
              className={cn(
                pillVariants({ size: 'circle', variant: 'lime' }),
                'border border-lime',
              )}
              key={item}
            >
              {item}
            </span>
          ) : (
            <PillLink href={hrefFor(item)} key={item} size="circle" variant="outline">
              {item}
            </PillLink>
          ),
        )}

        {page < totalPages ? (
          <PillLink
            aria-label="Další strana"
            className="text-lime"
            href={hrefFor(page + 1)}
            size="circle"
            variant="dark"
          >
            →
          </PillLink>
        ) : (
          <span
            aria-hidden
            className={cn(pillVariants({ size: 'circle', variant: 'dark' }), 'text-white/35')}
          >
            →
          </span>
        )}
      </div>
    </div>
  )
}
