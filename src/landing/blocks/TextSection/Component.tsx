import type { TextSectionBlockType } from '@/payload-types'

import React from 'react'

import RichText from '@/components/RichText/Server'
import { cn } from '@/utilities/ui'

import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

/** Textová sekce — Lexical obsah, volitelně v bílé kartě. */
export function TextSectionBlockComponent({ block }: { block: TextSectionBlockType }) {
  // live preview renderuje blok i před vyplněním povinného obsahu
  if (!block.content) return null

  return (
    <SectionShell>
      <Reveal>
        <div className={cn(block.appearance === 'card' && 'rounded-card bg-surface p-4.5 md:p-13')}>
          <RichText
            className="prose-headings:tracking-[-0.025em] prose-a:text-club mx-0 max-w-none md:prose-lg"
            data={block.content}
            enableGutter={false}
          />
        </div>
      </Reveal>
    </SectionShell>
  )
}
