import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/landing/ui/Badge'
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
      <Button asChild size="sm" variant="outline">
        <Link href={routes.list.posts}>← Zpět na aktuality</Link>
      </Button>
    </div>
  )
}
