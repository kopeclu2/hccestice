import React from 'react'

import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { ExternalEmbedBlock } from '@/payload-types'

/** Externí obsah — iframe (FB feed, tabulka ahl.cz…). */
export function ExternalEmbedBlockComponent({ block }: { block: ExternalEmbedBlock }) {
  return (
    <SectionShell>
      <Reveal>
        {block.title && (
          <SectionTitle className="mb-6">
            <Highlight>{block.title}</Highlight>
          </SectionTitle>
        )}
        <div className="overflow-hidden rounded-card bg-surface p-2">
          <iframe
            className="w-full rounded-section border-0"
            loading="lazy"
            src={block.url}
            style={{ height: `${(block.height ?? 600) / 16}rem` }}
            title={block.title ?? 'Externí obsah'}
          />
        </div>
      </Reveal>
    </SectionShell>
  )
}
