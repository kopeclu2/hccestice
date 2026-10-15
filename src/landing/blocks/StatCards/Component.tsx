import React from 'react'

import { Numeral } from '@/landing/ui/Numeral'
import { cn } from '@/lib/utils'
import type { StatCardsBlockType } from '@/payload-types'

/**
 * Statistické karty v těle článku — bílé/tmavé karty s velkým číslem
 * (zelené na bílé, lime na tmavé) a šedým popiskem.
 */
export function StatCardsBlockComponent({ block }: { block: StatCardsBlockType }) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <div className="my-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {items.map((item, index) => (
        <div
          className={cn(
            'rounded-thumb px-4.5 py-4 md:px-5.5 md:py-5 lg:px-6 lg:py-5.5',
            item.dark ? 'bg-contrast text-on-contrast' : 'border border-line-mid bg-surface',
          )}
          key={item.id ?? index}
        >
          <Numeral as="div" className={cn(item.dark ? 'text-lime' : 'text-club')} size="xl">
            {item.value}
          </Numeral>
          <div
            className={cn('mt-1 text-sm font-medium', item.dark ? 'text-white/60' : 'text-faint')}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
