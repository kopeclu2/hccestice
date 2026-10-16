import { Quote } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { getMediaUrl } from '@/lib/getMediaUrl'
import type { Media, TestimonialsBlock } from '@/payload-types'

/** Ohlasy — citátové karty se jménem, rolí a fotkou. */
export function TestimonialsBlockComponent({ block }: { block: TestimonialsBlock }) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <SectionShell>
      {block.title && (
        <Reveal>
          <SectionTitle className="mb-8">
            <Highlight>{block.title}</Highlight>
          </SectionTitle>
        </Reveal>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const photo = typeof item.photo === 'object' ? (item.photo as Media | null) : null
          return (
            <Reveal delay={index * 0.06} key={item.id ?? index}>
              <figure className="flex h-full flex-col rounded-tile bg-surface p-4.5 md:p-6 lg:p-6.5">
                <Quote aria-hidden className="size-7 fill-current text-lime" strokeWidth={0} />
                <blockquote className="mt-3 flex-1 leading-relaxed text-pretty text-ink">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {photo?.url ? (
                    <Image
                      alt={item.name}
                      className="size-11 rounded-full object-cover"
                      height={44}
                      src={getMediaUrl(photo.url, photo.updatedAt)}
                      width={44}
                    />
                  ) : (
                    <span className="grid size-11 place-items-center rounded-full bg-chip text-sm font-bold text-club-dark">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-bold">{item.name}</span>
                    {item.role && (
                      <span className="block text-xs font-medium text-faint">{item.role}</span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
