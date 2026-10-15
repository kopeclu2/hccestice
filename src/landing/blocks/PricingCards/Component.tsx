import { Check } from 'lucide-react'
import React from 'react'

import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { PillLink } from '@/landing/ui/PillLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { cn } from '@/lib/utils'
import type { PricingCardsBlock } from '@/payload-types'

/** Členské příspěvky — pricing karty, zvýrazněná je klubově zelená. */
export function PricingCardsBlockComponent({ block }: { block: PricingCardsBlock }) {
  const cards = block.cards ?? []
  if (cards.length === 0) return null

  return (
    <SectionShell>
      <Reveal>
        {block.title && <SectionTitle className="text-center">{block.title}</SectionTitle>}
        {block.perex && (
          <p className="mx-auto mt-3 max-w-120 text-center leading-relaxed text-pretty text-dim">
            {block.perex}
          </p>
        )}
      </Reveal>
      <div className="mt-9 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const highlighted = Boolean(card.highlighted)
          return (
            <Reveal delay={index * 0.08} key={card.id ?? index}>
              <div
                className={cn(
                  'flex h-full flex-col rounded-panel p-4.5 md:p-6 lg:p-7',
                  highlighted ? 'bg-club text-white' : 'bg-surface',
                )}
              >
                <Eyebrow tone={highlighted ? 'lime' : 'club'}>{card.name}</Eyebrow>
                <div className="mt-2 flex items-baseline gap-2">
                  <Numeral size="xl">{card.price}</Numeral>
                  {card.period && (
                    <span className={cn('text-sm', highlighted ? 'text-white/65' : 'text-faint')}>
                      {card.period}
                    </span>
                  )}
                </div>
                {card.description && (
                  <p className={cn('mt-2 text-sm', highlighted ? 'text-white/85' : 'text-dim')}>
                    {card.description}
                  </p>
                )}
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {(card.features ?? []).map((feature, featureIndex) => (
                    <li className="flex items-start gap-2.5 text-sm" key={featureIndex}>
                      <Check
                        className={cn(
                          'mt-0.5 size-4 flex-none',
                          highlighted ? 'text-lime' : 'text-club',
                        )}
                        strokeWidth={3}
                      />
                      {feature.text}
                    </li>
                  ))}
                </ul>
                {card.ctaLabel && card.ctaHref && (
                  <PillLink
                    className="mt-6 self-start"
                    href={card.ctaHref}
                    size="md"
                    variant={highlighted ? 'light' : 'dark'}
                    withArrow
                  >
                    {card.ctaLabel}
                  </PillLink>
                )}
              </div>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
