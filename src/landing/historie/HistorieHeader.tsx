import React from 'react'

import { cn } from '@/utilities/ui'

import { SectionTitle } from '../components/Heading'
import { Highlight } from '../components/Kicker'
import { PageHeader } from '../components/PageHeader'
import { HISTORY_PAGE } from '../content'

/**
 * Hlavička historie klubu: obrysový watermark „1954", drobečky, titulek
 * s lime zvýrazněním, perex a čtyři statistické karty (třetí tmavá).
 *
 * Watermark je větší než u ostatních hlaviček (letopočet je široký) a má
 * stažený tracking — proto override místo výchozího stupně.
 */
export function HistorieHeader() {
  return (
    <PageHeader
      perex={HISTORY_PAGE.perex}
      perexWidth="lg"
      title={
        <>
          {HISTORY_PAGE.headlineLight} <Highlight>{HISTORY_PAGE.headlineHighlight}</Highlight>
        </>
      }
      trail={[{ label: HISTORY_PAGE.breadcrumb }]}
      watermark={HISTORY_PAGE.watermark}
      watermarkClassName="-top-17.5 -right-10 text-watermark-2xl tracking-[-0.06em]"
    >
      <div className="mt-9.5 grid max-w-270 grid-cols-2 gap-3 md:grid-cols-4 md:gap-3.5">
        {HISTORY_PAGE.stats.map((stat) => (
          <div
            className={cn(
              'rounded-thumb px-5.5 py-5',
              stat.tone === 'dark' ? 'bg-contrast text-on-contrast' : 'border border-line-mid bg-surface',
            )}
            key={stat.label}
          >
            <SectionTitle
              className={cn(
                'leading-none',
                stat.tone === 'club' && 'text-club',
                stat.tone === 'dark' && 'text-lime',
              )}
            >
              {stat.value}
            </SectionTitle>
            <div
              className={cn(
                'mt-1 text-caption font-semibold',
                stat.tone === 'dark' ? 'text-white/60' : 'text-faint',
              )}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </PageHeader>
  )
}
