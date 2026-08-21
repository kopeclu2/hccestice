import type { ExternalEmbedBlock } from '@/payload-types'

import React from 'react'

import { SectionTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

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
