import type { StatCardsBlockType } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { Numeral } from '../../components/Numeral'

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
            'rounded-thumb px-6 py-5.5',
            item.dark ? 'bg-contrast text-on-contrast' : 'border border-line-mid bg-surface',
          )}
          key={item.id ?? index}
        >
          <Numeral as="div" className={cn(item.dark ? 'text-lime' : 'text-club')} size="xl">
            {item.value}
          </Numeral>
          <div
            className={cn(
              'mt-1 text-meta font-semibold',
              item.dark ? 'text-white/60' : 'text-faint',
            )}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
