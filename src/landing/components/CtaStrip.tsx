import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle } from './Heading'
import { SectionShell, type SectionShellProps } from './SectionShell'
import { Watermark } from './Watermark'

const panelVariants = cva(
  'relative flex flex-wrap items-center gap-6 overflow-hidden rounded-section px-4.5 py-6 text-white md:px-11 md:py-9',
  {
    variants: {
      /** Tmavý pás (sítě, fotky, archiv) vs. klubová zelená (soupiska, zápasy). */
      tone: { ink: 'bg-contrast', club: 'bg-club' },
    },
    defaultVariants: { tone: 'ink' },
  },
)

/** Ztišení perexu se mezi tóny liší — na zelené musí být o stupeň světlejší. */
const perexTone = { ink: 'text-white/65', club: 'text-white/75' } as const

export type CtaStripProps = {
  headline: React.ReactNode
  perex?: React.ReactNode
  /** Obrysové slovo v pravém dolním rohu pásu (jen zelená varianta: „HCČ"). */
  watermark?: React.ReactNode
  /** CTA vpravo — jeden nebo víc `PillLink`. */
  children: React.ReactNode
  /**
   * `VariantProps` by tu připustilo i `null` (cva to dovoluje), ale `tone`
   * indexuje `perexTone` — proto vlastní, užší typ.
   */
  tone?: NonNullable<VariantProps<typeof panelVariants>['tone']>
} & Pick<SectionShellProps, 'className' | 'spacing'>

/**
 * CTA pás na konci podstránky: nadpis + perex vlevo, CTA vpravo.
 *
 * Pět podstránek mělo tenhle pás zkopírovaný (`SocialCta`, `PhotosCta`,
 * `ArchiveCta`, `RosterCta`, `MatchesCta`) — dva z nich byly identické
 * až na dva stringy a href. Obal si navíc ručně přepisoval základní
 * class `SectionShell`u.
 *
 * Blok `CtaBanner` (`landing/blocks/CtaBanner`) je jiná komponenta
 * (fotka na pozadí, `Eyebrow`, stackovaný layout) — nesloučovat.
 */
export function CtaStrip({
  children,
  className,
  headline,
  perex,
  spacing = 'cta',
  tone = 'ink',
  watermark,
}: CtaStripProps) {
  return (
    <SectionShell className={className} spacing={spacing}>
      <div className={panelVariants({ tone })}>
        {watermark && (
          <Watermark className="-right-7.5 -bottom-12.5 text-watermark-md tracking-[-0.06em] text-white/14">
            {watermark}
          </Watermark>
        )}

        <div className="relative min-w-60">
          <CardTitle size="lg">{headline}</CardTitle>
          {perex && <div className={cn('mt-1.5 text-meta', perexTone[tone])}>{perex}</div>}
        </div>

        <div className="flex-1" />

        <div className="relative flex flex-wrap gap-2.5">{children}</div>
      </div>
    </SectionShell>
  )
}
