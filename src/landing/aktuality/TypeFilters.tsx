import React from 'react'

import { PillLink } from '../components/PillLink'
import { POST_TYPE_LABEL } from '../data/posts'

/**
 * Filtr typů článků — pilulkové odkazy, stav filtru žije v URL (`?typ=`).
 * Změna filtru vynechá `page`, takže se výpis vrátí na první stranu.
 */
export function TypeFilters({ activeType }: { activeType: string | null }) {
  const items: Array<{ key: string | null; label: string }> = [
    { key: null, label: 'Vše' },
    ...Object.entries(POST_TYPE_LABEL).map(([key, label]) => ({ key, label })),
  ]

  return (
    <>
      {items.map(({ key, label }) => {
        const active = key === activeType
        return (
          <PillLink
            href={key ? `/aktuality?typ=${key}#seznam` : '/aktuality#seznam'}
            key={label}
            selected={active}
            size="sm"
            variant="outline"
          >
            {label}
          </PillLink>
        )
      })}
    </>
  )
}
