import React from 'react'

import { SEASON_STATS } from '@/landing/content'
import { fetchAutoStats } from '@/landing/features/matches/data/seasons'
import { relId } from '@/landing/lib/payload'
import type { StatsContent } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { cn } from '@/lib/utils'
import type { LandingStatsBlock } from '@/payload-types'

/**
 * Prázdný text z CMS (`''`) se má chovat jako nevyplněný, ne jako obsah —
 * s `??` přebil neprázdné označení sezóny z `fetchAutoStats` a v nadpisu
 * zůstal prázdný lime čtverec.
 */
const text = (value: string | null | undefined): string | null => value?.trim() || null

/** Ruční čísla z bloku mají přednost; `auto` dodá fetchAutoStats. */
function mapStats(block: LandingStatsBlock, auto: StatsContent | null): StatsContent {
  const manual = (block.items ?? []).map((stat) => ({
    value: stat.value,
    label: stat.label,
    accent: Boolean(stat.accent),
  }))
  if (manual.length > 0) {
    return {
      seasonLabel: text(block.seasonLabel) ?? auto?.seasonLabel ?? SEASON_STATS.seasonLabel,
      items: manual,
    }
  }
  if (auto) {
    return { seasonLabel: text(block.seasonLabel) ?? auto.seasonLabel, items: auto.items }
  }
  return {
    seasonLabel: text(block.seasonLabel) ?? SEASON_STATS.seasonLabel,
    items: [...SEASON_STATS.items],
  }
}

/** Čísla sezóny: auto-výpočet z kolekcí, ruční pole bloku mají přednost. */
export async function StatsBlockComponent({ block }: { block: LandingStatsBlock }) {
  const auto = (block.items ?? []).length > 0 ? null : await fetchAutoStats(relId(block.season))
  return <StatsView stats={mapStats(block, auto)} />
}

/**
 * „Sezóna 2025/2026 v číslech" — hlavička jako u ostatních sekcí (Kicker +
 * SectionTitle), čtyři čísla v kartách po vzoru `HistoryHeader` (třetí
 * tmavá). Dřív tu byla jen odstavcem malá věta uprostřed a čísla plavala bez
 * rámce na pozadí — vedle historie, kde stejná čtveřice má karty, to
 * působilo jako nedokončený blok.
 */
function StatsView({ stats }: { stats: StatsContent }) {
  const seasonLabel = stats.seasonLabel.trim()
  return (
    <SectionShell>
      <Reveal>
        <Kicker>Sezóna</Kicker>
        <SectionTitle className="mt-3.5" size="md">
          {seasonLabel ? (
            <>
              <Highlight>{seasonLabel}</Highlight> v číslech
            </>
          ) : (
            'Sezóna v číslech'
          )}
        </SectionTitle>

        {/* Auto-fit až od `lg`: na tabletu se vešly tři sloupce ze čtyř a
            poslední číslo osiřelo na druhém řádku. Do 1024px proto zůstává
            čtvercová mřížka 2×2 — stejná past jako u `HistoryHeader`. */}
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(min(11.875rem,100%),1fr))] lg:gap-3.5">
          {stats.items.map((stat, index) => {
            const dark = index === 2
            return (
              <div
                className={cn(
                  'rounded-thumb px-4.5 py-4 text-center md:px-5 md:py-4.5 lg:px-5.5 lg:py-5',
                  dark
                    ? 'border border-transparent bg-contrast text-on-contrast'
                    : 'border border-line-mid bg-surface',
                )}
                key={stat.label}
              >
                <Numeral className={cn(!dark && stat.accent && 'text-club-dark')} size="2xl">
                  {stat.value}
                </Numeral>
                <div className={cn('mt-1 text-sm', dark ? 'text-white/60' : 'text-faint')}>
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </Reveal>
    </SectionShell>
  )
}
