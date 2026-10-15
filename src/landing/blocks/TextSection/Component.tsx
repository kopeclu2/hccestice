import React from 'react'

import RichText from '@/components/RichText/Server'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { cn } from '@/lib/utils'
import type { TextSectionBlockType } from '@/payload-types'

/** Textová sekce — Lexical obsah, volitelně v bílé kartě. */
export function TextSectionBlockComponent({ block }: { block: TextSectionBlockType }) {
  // live preview renderuje blok i před vyplněním povinného obsahu
  if (!block.content) return null

  return (
    <SectionShell>
      <Reveal>
        <div
          className={cn(
            block.appearance === 'card' && 'rounded-card bg-surface p-4.5 md:p-8 lg:p-13',
          )}
        >
          <RichText
            className="mx-0 max-w-none md:prose-lg prose-headings:tracking-[-0.025em] prose-a:text-club"
            data={block.content}
            enableGutter={false}
          />
        </div>
      </Reveal>
    </SectionShell>
  )
}
