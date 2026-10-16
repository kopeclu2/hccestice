import { Minus, Plus } from 'lucide-react'
import React from 'react'

import type { FaqItem } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { SectionShell } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'

/**
 * Časté otázky — accordion ve dvou sloupcích (CSS columns),
 * otevřená je vždy nejvýš jedna položka (první při načtení), toggle +/−.
 *
 * Nativní `<details>`/`<summary>`, ne Radix Accordion: je to Server Component
 * bez řádku klientského JS. Stav, Enter/mezerník a `aria-expanded` řeší
 * prohlížeč. Radix navíc uměl šipky a Home/End mezi otázkami — to je ve
 * WAI-ARIA vzoru volitelné a tady se za něj nevyplatí ~7 kB gzip na každé
 * stránce s FAQ.
 *
 * Společné `name` dělá z `<details>` výlučnou skupinu (otevření jedné zavře
 * ostatní). Skupina je **na blok** (`useId`, funguje i v Server Componentě):
 * se sdíleným `name="faq"` by dva FAQ bloky na jedné stránce zavíraly jeden
 * druhého. Podpora: Chrome 120, Safari 17.2, Firefox 130; starší prohlížeč
 * skupinu ignoruje a nechá otevřít víc otázek najednou, nic se nerozbije.
 * Ikona +/− se přepíná CSS podle `open`, ne Reactem.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const groupName = `faq-${React.useId()}`

  if (items.length === 0) return null

  return (
    <SectionShell>
      <Watermark className="top-10 -left-10 text-watermark-sm tracking-title-tight text-ink/9">
        OTÁZKY?
      </Watermark>

      <SectionTitle className="mb-7">Časté otázky</SectionTitle>

      <div className="columns-1 gap-5 md:columns-2">
        {items.map((item, index) => (
          <details
            className="group mb-4 break-inside-avoid rounded-row bg-surface"
            key={`${index}-${item.question}`}
            name={groupName}
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-row px-4.5 py-4 text-base marker:content-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-club md:px-5 md:py-4.25 lg:px-5.5 lg:py-4.5 [&::-webkit-details-marker]:hidden">
              <h3 className="flex-1 font-semibold">{item.question}</h3>
              <span className="grid size-7 flex-none place-items-center rounded-full bg-chip [&_svg]:size-3.5">
                <Plus aria-hidden className="group-open:hidden" />
                <Minus aria-hidden className="hidden group-open:block" />
              </span>
            </summary>
            <p className="max-w-160 px-4.5 pb-4 text-sm leading-relaxed text-pretty text-dim md:px-5 md:pb-4.25 md:text-base lg:px-5.5 lg:pb-4.5">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </SectionShell>
  )
}
