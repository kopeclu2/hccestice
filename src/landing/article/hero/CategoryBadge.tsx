import React from 'react'

import { Badge } from '../../components/Badge'

/** Lime štítek kategorie nad titulkem hero („Sezóna", „Zápasy"…). */
export function CategoryBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Badge caps className={className} size="xs" variant="lime">
      {children}
    </Badge>
  )
}
