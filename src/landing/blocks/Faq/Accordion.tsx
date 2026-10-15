'use client'

import { Minus, Plus } from 'lucide-react'
import React from 'react'

import type { FaqItem } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { SectionShell } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'

/**
 * Časté otázky — accordion ve dvou sloupcích (CSS columns),
 * otevřená je vždy nejvýš jedna položka, toggle +/−.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number>(0)

  if (items.length === 0) return null

  return (
    <SectionShell>
      <Watermark className="top-10 -left-10 text-watermark-sm tracking-title-tight text-ink/9">
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
                className="flex w-full cursor-pointer items-center gap-4 px-4.5 py-4 text-left md:px-5 md:py-4.25 lg:px-5.5 lg:py-4.5"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                type="button"
              >
                <span className="flex-1 font-semibold">{item.question}</span>
                <span className="grid size-7 flex-none place-items-center rounded-full bg-chip [&_svg]:size-3.5">
                  {isOpen ? <Minus /> : <Plus />}
                </span>
              </button>
              {isOpen && (
                <p className="max-w-160 px-4.5 pb-4 text-sm leading-relaxed text-pretty text-dim md:px-5 md:pb-4.25 md:text-base lg:px-5.5 lg:pb-4.5">
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
