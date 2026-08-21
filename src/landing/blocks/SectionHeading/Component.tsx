import type { SectionHeadingBlockType } from '@/payload-types'

import React from 'react'

import { SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

/** Nadpis sekce — kicker + H2 s lime zvýrazněním + volitelné CTA vpravo. */
export function SectionHeadingBlockComponent({ block }: { block: SectionHeadingBlockType }) {
  return (
    <SectionShell>
      <Reveal>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            {block.kicker && <Kicker>{block.kicker}</Kicker>}
            <SectionTitle className="mt-3.5">
              {block.title} {block.titleHighlight && <Highlight>{block.titleHighlight}</Highlight>}
            </SectionTitle>
            {block.perex && (
              <p className="text-dim mt-3 max-w-140 leading-relaxed text-pretty">{block.perex}</p>
            )}
          </div>
          <div className="flex-1" />
          {block.ctaLabel && block.ctaHref && (
            <PillLink href={block.ctaHref} size="md" variant="dark" withArrow>
              {block.ctaLabel}
            </PillLink>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
