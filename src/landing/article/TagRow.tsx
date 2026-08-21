import React from 'react'

import { Badge } from '../components/Badge'
import { PillLink } from '../components/PillLink'

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
      <PillLink href="/#aktuality" size="sm" variant="outline">
        ← Zpět na aktuality
      </PillLink>
    </div>
  )
}
