import React from 'react'

import { cn } from '@/utilities/ui'

import { CardTitle, SectionTitle } from '../components/Heading'
import { Highlight, Kicker, Eyebrow } from '../components/Kicker'

/** Varianta hlavičky: linka (stránka /zapasy) nebo landing nadpis (home). */
export type SectionHeadVariant = 'rule' | 'landing'

/**
 * Hlavička sekce zápasů ve dvou variantách:
 *
 * - `rule` (výchozí, /zapasy) — nadpis na silné tmavé lince, vpravo
 *   volitelný uppercase popisek (na mobilu skrytý) a případné ovládání.
 * - `landing` (home page) — stejný vzor jako ostatní sekce landingu:
 *   kicker s popiskem, pod ním velký nadpis s lime zvýrazněním poslední
 *   části a vpravo ovládání (proklik na /zapasy).
 */
export function SectionHead({
  title,
  note,
  noteMuted = true,
  variant = 'rule',
  children,
}: {
  title: string
  note?: string | null
  /** `false` = běžný popisek (tabulka), jinak drobný uppercase štítek. */
  noteMuted?: boolean
  variant?: SectionHeadVariant
  children?: React.ReactNode
}) {
  if (variant === 'landing') {
    const words = title.trim().split(/\s+/)
    const highlight = words.at(-1) ?? title
    const start = words.slice(0, -1).join(' ')

    return (
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3.5">
        <div className="min-w-0">
          {note && <Kicker>{note}</Kicker>}
          <SectionTitle className={cn('text-pretty', note && 'mt-4')} size="md">
            {start ? `${start} ` : ''}
            <Highlight>{highlight}</Highlight>
          </SectionTitle>
        </div>
        <div className="flex-1" />
        {children}
      </div>
    )
  }

  return (
    <div className="border-contrast flex items-center gap-3.5 border-b-2 pb-3.5">
      <CardTitle className="m-0" size="lg">
        {title}
      </CardTitle>
      <div className="flex-1" />
      {note &&
        (noteMuted ? (
          <Eyebrow className="hidden md:block" tone="dark" wide>
            {note}
          </Eyebrow>
        ) : (
          <span className="text-faint text-caption font-bold">{note}</span>
        ))}
      {children}
    </div>
  )
}
