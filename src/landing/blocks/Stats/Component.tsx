import type { LandingStatsBlock } from '@/payload-types'

import React from 'react'

import { Numeral } from '../../components/Numeral'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { SEASON_STATS } from '../../content'
import { relId } from '../../data/format'
import { fetchAutoStats } from '../../data/seasons'
import type { StatsContent } from '../../types'
import { cn } from '@/utilities/ui'

/** Ruční čísla z bloku mají přednost; `auto` dodá fetchAutoStats. */
function mapStats(block: LandingStatsBlock, auto: StatsContent | null): StatsContent {
  const manual = (block.items ?? []).map((stat) => ({
    value: stat.value,
    label: stat.label,
    accent: Boolean(stat.accent),
  }))
  if (manual.length > 0) {
    return {
      seasonLabel: block.seasonLabel ?? auto?.seasonLabel ?? SEASON_STATS.seasonLabel,
      items: manual,
    }
  }
  if (auto) {
    return { seasonLabel: block.seasonLabel ?? auto.seasonLabel, items: auto.items }
  }
  return {
    seasonLabel: block.seasonLabel ?? SEASON_STATS.seasonLabel,
    items: [...SEASON_STATS.items],
  }
}

/** Čísla sezóny: auto-výpočet z kolekcí, ruční pole bloku mají přednost. */
export async function StatsBlockComponent({ block }: { block: LandingStatsBlock }) {
  const auto = (block.items ?? []).length > 0 ? null : await fetchAutoStats(relId(block.season))
  return <StatsView stats={mapStats(block, auto)} />
}

/** „Sezóna 2025/2026 v číslech" — čtyři velká čísla, watermark PONÍCI. */
function StatsView({ stats }: { stats: StatsContent }) {
  return (
    <SectionShell>
      <Watermark className="text-club/12 -right-5 -bottom-25 text-watermark-xs">PONÍCI</Watermark>

      <Reveal>
        <p className="text-faint mb-8.5 text-center text-body">
          Sezóna{' '}
          <span className="bg-lime text-ink px-2 py-0.25 font-bold">{stats.seasonLabel}</span> v
          číslech
        </p>

        {/* Auto-fit až od `lg`: na tabletu se vešly tři sloupce ze čtyř a
            poslední číslo osiřelo na druhém řádku. Do 1024px proto zůstává
            čtvercová mřížka 2×2. */}
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-[repeat(auto-fit,minmax(min(11.875rem,100%),1fr))]">
          {stats.items.map((stat) => (
            <div className="text-center" key={stat.label}>
              <dd>
                <Numeral className={cn(stat.accent && 'text-club')} size="2xl">
                  {stat.value}
                </Numeral>
              </dd>
              <dt className="text-faint mt-1 text-meta">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </SectionShell>
  )
}
