import React from 'react'

import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { PillLink } from '@/landing/ui/PillLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { SectionHeadingBlockType } from '@/payload-types'

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
              <p className="mt-3 max-w-140 leading-relaxed text-pretty text-dim">{block.perex}</p>
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
