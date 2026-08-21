'use client'

import { Minus, Plus } from 'lucide-react'
import React from 'react'

import { HockeyStick } from '../../components/Decorations'
import { SectionTitle } from '../../components/Heading'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import type { FaqItem } from '../../types'

/**
 * Časté otázky — accordion ve dvou sloupcích (CSS columns),
 * otevřená je vždy nejvýš jedna položka, toggle +/−.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number>(0)

  if (items.length === 0) return null

  return (
    <SectionShell>
      <HockeyStick className="-right-18 top-30 -rotate-22" />
      <Watermark className="text-ink/9 -left-10 top-10 text-watermark-sm tracking-[-0.04em]">
        OTÁZKY?
      </Watermark>

      <SectionTitle className="mb-7">Časté otázky</SectionTitle>

      <div className="columns-1 gap-5 md:columns-2">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div className="mb-4 break-inside-avoid rounded-row bg-surface" key={item.question}>
              <button
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center gap-4 px-5.5 py-4.5 text-left"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                type="button"
              >
                <span className="flex-1 font-bold">{item.question}</span>
                <span className="bg-chip grid size-7 flex-none place-items-center rounded-full [&_svg]:size-3.5">
                  {isOpen ? <Minus /> : <Plus />}
                </span>
              </button>
              {isOpen && (
                <p className="text-dim max-w-160 px-5.5 pb-4.5 text-body leading-relaxed text-pretty">
                  {item.answer}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}
