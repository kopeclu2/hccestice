import React from 'react'

import { PillLink } from './PillLink'

/** Pilulka filtru sezón (slug + krátký label „2025/26"). */
export type SeasonPill = { slug: string; label: string }

/**
 * Filtr sezón — pilulkové odkazy, stav filtru žije v URL (`?sezona=`).
 * Změna filtru vynechá `page`, takže se výpis vrátí na první stranu.
 *
 * `allLabel` přidá na začátek položku bez filtru („Vše" na /fotogalerie);
 * stránky, kde sezóna vybraná být musí (/zapasy), ji vynechají.
 */
export function SeasonFilters({
  seasons,
  activeSlug,
  basePath,
  anchor = '',
  allLabel,
}: {
  seasons: SeasonPill[]
  activeSlug: string | null
  basePath: string
  anchor?: string
  allLabel?: string
}) {
  const items: Array<{ slug: string | null; label: string }> = [
    ...(allLabel ? [{ slug: null, label: allLabel }] : []),
    ...seasons,
  ]

  return (
    <>
      {items.map(({ slug, label }) => (
        <PillLink
          href={`${basePath}${slug ? `?sezona=${slug}` : ''}${anchor}`}
          key={label}
          selected={slug === activeSlug}
          size="sm"
          variant="outline"
        >
          {label}
        </PillLink>
      ))}
    </>
  )
}
