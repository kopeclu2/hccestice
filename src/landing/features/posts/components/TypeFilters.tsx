import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { POST_TYPE_LABEL } from '@/landing/features/posts/view/posts'
import { buildListUrl } from '@/landing/lib/listUrl'
import { routes } from '@/lib/routes'

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
          <Button asChild key={label} selected={active} size="sm" variant="outline">
            <Link
              aria-current={active ? 'true' : undefined}
              href={buildListUrl(routes.list.posts, { filters: { typ: key }, hash: 'seznam' })}
            >
              {label}
            </Link>
          </Button>
        )
      })}
    </>
  )
}
