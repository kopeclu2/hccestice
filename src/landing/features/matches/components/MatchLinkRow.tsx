import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { MatchCardData } from '@/landing/features/matches/types'
import { matchLinkTitle } from '@/landing/features/matches/view/matchLink'

/**
 * Odkaz na zápas v textu článku (nástroj „Relace" v editoru): titulek zápasu,
 * datum a u odehraného zápasu skóre. Zápas bez adresy (`href` prázdný) se
 * nevykreslí — odkaz by nikam nevedl.
 */
export function MatchLinkRow({ card }: { card: MatchCardData }) {
  if (!card.href) return null

  return (
    <Link
      className="group not-prose my-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-tile border border-line-soft bg-surface px-4.5 py-3.5 font-display text-ink transition-colors hover:border-club md:px-6"
      href={card.href}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-pretty md:text-base">
          {matchLinkTitle(card)}
        </span>
        <span className="mt-0.5 block text-xs font-medium text-faint">
          {[card.dateLabel, card.competition].filter(Boolean).join(' · ')}
        </span>
      </span>
      <span className="flex items-center gap-2 text-sm font-bold tabular-nums">
        {card.score && (
          <span>
            {card.score}
            {card.suffix && ` ${card.suffix}`}
          </span>
        )}
        <ArrowUpRight
          aria-hidden
          className="size-4 text-club-dark transition-colors group-hover:text-club"
          strokeWidth={2.5}
        />
      </span>
    </Link>
  )
}
