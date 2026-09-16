import React from 'react'

import { cn } from '@/utilities/ui'

import { pillVariants } from './pill'
import { PillLink } from './PillLink'

/** Pilulka filtru sezón (slug + krátký label „2025/26"). */
export type SeasonPill = { slug: string; label: string }

/**
 * Filtr sezón — pilulkové odkazy, stav filtru žije v URL (`?sezona=`).
 * Změna filtru vynechá `page`, takže se výpis vrátí na první stranu.
 *
 * `allLabel` přidá na začátek položku bez filtru („Vše" na /fotogalerie);
 * stránky, kde sezóna vybraná být musí (/zapasy), ji vynechají.
 *
 * `maxVisible` sbalí starší sezóny za `<details>` „Starší ▾" — bez JS, čistě
 * nativní disclosure (`display: contents` na `<details>`, stejný trik jako
 * `max-md:contents` v `PageHeader`, takže se pilulky uvnitř řadí do téhož
 * flex řádku jako ty viditelné). `/fotogalerie` má 18+ sezón a bez sbalení
 * to na desktopu vyjde na dvě řady nad prvním obsahem; `/zapasy` s pár
 * sezónami `maxVisible` nedostává, takže se chová jako dřív.
 */
export function SeasonFilters({
  seasons,
  activeSlug,
  basePath,
  anchor = '',
  allLabel,
  maxVisible,
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
  basePath: string
  anchor?: string
  allLabel?: string
  maxVisible?: number
}) {
  const items: Array<{ slug: string | null; label: string }> = [
    ...(allLabel ? [{ slug: null, label: allLabel }] : []),
    ...seasons,
  ]

  const collapse = maxVisible != null && items.length > maxVisible
  const visible = collapse ? items.slice(0, maxVisible) : items
  const rest = collapse ? items.slice(maxVisible) : []
  const activeInRest = rest.some((item) => item.slug === activeSlug)

  const pill = ({ slug, label }: (typeof items)[number]) => (
    <PillLink
      aria-current={slug === activeSlug ? 'true' : undefined}
      href={`${basePath}${slug ? `?sezona=${slug}` : ''}${anchor}`}
      key={label}
      selected={slug === activeSlug}
      size="sm"
      variant="outline"
    >
      {label}
    </PillLink>
  )

  return (
    <>
      {visible.map(pill)}
      {collapse && (
        <details className="contents" open={activeInRest}>
          <summary
            className={cn(
              pillVariants({ size: 'sm', variant: 'outline' }),
              'list-none [&::-webkit-details-marker]:hidden',
            )}
          >
            Starší ▾
          </summary>
          {rest.map(pill)}
        </details>
      )}
    </>
  )
}
