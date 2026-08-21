import React from 'react'

import { SectionTitle } from '../components/Heading'
import { Eyebrow, Highlight } from '../components/Kicker'
import { Reveal } from '../components/Reveal'
import type { HistoryEra } from '../types'

import { MilestoneRow } from './MilestoneRow'

/**
 * Éra timeline: nadpis v lime bloku, rozsah let vpravo, 2px ink linka
 * a pod ní milníky oddělené vlasovou linkou.
 */
export function EraSection({ era }: { era: HistoryEra }) {
  return (
    <section className="scroll-mt-8" id={`era-${era.value}`}>
      <Reveal>
        <div className="border-contrast flex flex-wrap items-baseline gap-x-4 gap-y-3 border-b-2 pb-4">
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
