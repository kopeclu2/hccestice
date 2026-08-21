import type { MapEmbedBlock } from '@/payload-types'

import React from 'react'

import { Badge } from '../../components/Badge'
import { SectionTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

/** Mapa — vložená mapa v zaoblené kartě + adresní pilulky. */
export function MapEmbedBlockComponent({ block }: { block: MapEmbedBlock }) {
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
            allowFullScreen
            className="h-100 w-full rounded-section border-0 md:h-120"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={block.embedUrl}
            title={block.title ?? 'Mapa'}
          />
        </div>
        {(block.pills ?? []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {(block.pills ?? []).map((pill, index) => (
              <Badge className="bg-surface" key={index} size="md" variant="outline">
                {pill.text}
              </Badge>
            ))}
          </div>
        )}
      </Reveal>
    </SectionShell>
  )
}
