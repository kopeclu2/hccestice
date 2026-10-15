import { Minus, Plus } from 'lucide-react'
import React from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FaqItem } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { SectionShell } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'

/**
 * Časté otázky — accordion ve dvou sloupcích (CSS columns),
 * otevřená je vždy nejvýš jedna položka (první při načtení), toggle +/−.
 *
 * Stav, klávesnici (Tab, Enter/mezerník, šipky, Home/End) a ARIA
 * (`aria-expanded`, `aria-controls`, `region`) řeší Radix Accordion. Ikona
 * +/− se přepíná CSS podle `data-state` triggeru, ne Reactem.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null

  return (
    <SectionShell>
      <Watermark className="top-10 -left-10 text-watermark-sm tracking-title-tight text-ink/9">
        OTÁZKY?
      </Watermark>

      <SectionTitle className="mb-7">Časté otázky</SectionTitle>

      <Accordion
        className="columns-1 gap-5 md:columns-2"
        collapsible
        defaultValue="0"
        type="single"
      >
        {items.map((item, index) => (
          <AccordionItem
            className="mb-4 break-inside-avoid rounded-row border-b-0 bg-surface"
            key={item.question}
            value={String(index)}
          >
            <AccordionTrigger
              className="cursor-pointer items-center rounded-row px-4.5 py-4 text-base font-normal hover:no-underline md:px-5 md:py-4.25 lg:px-5.5 lg:py-4.5"
              indicator={
                <span className="grid size-7 flex-none place-items-center rounded-full bg-chip [&_svg]:size-3.5">
                  <Plus className="group-data-[state=open]:hidden" />
                  <Minus className="hidden group-data-[state=open]:block" />
                </span>
              }
            >
              <span className="flex-1 font-semibold">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <p className="max-w-160 px-4.5 pb-4 text-sm leading-relaxed text-pretty text-dim md:px-5 md:pb-4.25 md:text-base lg:px-5.5 lg:pb-4.5">
                {item.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
