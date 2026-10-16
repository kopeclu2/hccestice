import React from 'react'

import type { HistoryEra } from '@/landing/features/history/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'

import { MilestoneRow } from './MilestoneRow'

/**
 * Éra timeline: nadpis v lime bloku, rozsah let vpravo, 2px ink linka
 * a pod ní milníky oddělené vlasovou linkou.
 */
export function EraSection({ era }: { era: HistoryEra }) {
  return (
    <section className="scroll-mt-8" id={`era-${era.value}`}>
      <Reveal>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3 border-b-2 border-contrast pb-4">
          <SectionTitle size="lg">
            <Highlight>{era.title}</Highlight>
          </SectionTitle>
          <div className="flex-1" />
          <Eyebrow tone="faint">{era.range}</Eyebrow>
        </div>

        {era.milestones.map((milestone, index) => (
          <MilestoneRow index={index} key={milestone.key} milestone={milestone} />
        ))}
      </Reveal>
    </section>
  )
}
