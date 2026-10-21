import React from 'react'

import { HISTORY_PAGE } from '@/landing/content'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PageHeader } from '@/landing/ui/PageHeader'
import { cn } from '@/lib/utils'

/**
 * Hlavička historie klubu: obrysový watermark „1954", drobečky, titulek
 * s lime zvýrazněním, perex a čtyři statistické karty (třetí tmavá).
 *
 * Watermark je větší než u ostatních hlaviček (letopočet je široký) a má
 * stažený tracking — proto override místo výchozího stupně.
 */
export function HistoryHeader() {
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
      watermarkClassName="-top-17.5 -right-10 text-watermark-2xl tracking-display"
    >
      {/* Čtyři sloupce až od `lg`: na 768px měla karta ~165px a popisky
          („Nejlepší umístění") se lámaly do dvou řádků. */}
      <div className="mt-9.5 grid max-w-270 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3.5">
        {HISTORY_PAGE.stats.map((stat) => (
          <div
            className={cn(
              'rounded-thumb px-4.5 py-4 md:px-5 md:py-4.5 lg:px-5.5 lg:py-5',
              // Tmavá varianta nemá viditelný rámeček, ale border potřebuje:
              // bez něj je při `box-sizing: border-box` její obsah o 1px jinde
              // než u světlých karet ve stejném řádku.
              stat.tone === 'dark'
                ? 'border border-transparent bg-contrast text-on-contrast'
                : 'border border-line-mid bg-surface',
            )}
            key={stat.label}
          >
            <SectionTitle
              as="p"
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
                'mt-1 text-xs font-medium',
                stat.tone === 'dark' ? 'text-on-contrast-subtle' : 'text-faint',
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
