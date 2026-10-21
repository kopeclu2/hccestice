import React from 'react'

import { ClickToLoadEmbed } from '@/landing/ui/ClickToLoadEmbed'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { EMBED_SANDBOX, isAllowedEmbedUrl } from '@/lib/embedHosts'
import type { ExternalEmbedBlock } from '@/payload-types'

/** Externí obsah — iframe (FB feed, tabulka ahl.cz…). */
export function ExternalEmbedBlockComponent({ block }: { block: ExternalEmbedBlock }) {
  // Pojistka vedle validace pole: data zapsaná mimo admin (import, přímo do
  // databáze) nesmí vložit libovolný cizí web. Nepovolený host = nic.
  if (!isAllowedEmbedUrl(block.url)) return null

  return (
    <SectionShell>
      <Reveal>
        {block.title && (
          <SectionTitle className="mb-6">
            <Highlight>{block.title}</Highlight>
          </SectionTitle>
        )}
        <div className="overflow-hidden rounded-card bg-surface p-2">
          <ClickToLoadEmbed
            frameClassName="w-full rounded-section"
            frameStyle={{ height: `${(block.height ?? 600) / 16}rem` }}
            sandbox={EMBED_SANDBOX}
            src={block.url}
            title={block.title ?? 'Externí obsah'}
          />
        </div>
      </Reveal>
    </SectionShell>
  )
}
