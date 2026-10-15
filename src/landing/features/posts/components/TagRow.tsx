import React from 'react'

import { Badge } from '@/landing/ui/Badge'
import { PillLink } from '@/landing/ui/PillLink'
import { routes } from '@/lib/routes'

/** Štítky článku (kategorie) + návrat na výpis aktualit. */
export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line-mid pt-7">
      {tags.map((tag) => (
        <Badge key={tag} size="sm" variant="outline">
          {tag}
        </Badge>
      ))}
      <div className="hidden flex-1 md:block" />
      <PillLink href={routes.list.posts} size="sm" variant="outline">
        ← Zpět na aktuality
      </PillLink>
    </div>
  )
}
