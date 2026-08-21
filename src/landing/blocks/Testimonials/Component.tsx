import type { Media, TestimonialsBlock } from '@/payload-types'

import { Quote } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { SectionTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'

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
              <figure className="flex h-full flex-col rounded-tile bg-surface p-6.5">
                <Quote aria-hidden className="text-lime size-7 fill-current" strokeWidth={0} />
                <blockquote className="text-ink mt-3 flex-1 leading-relaxed text-pretty">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {photo?.url ? (
                    <Image
                      alt={item.name}
                      className="size-11 rounded-full object-cover"
                      height={44}
                      src={getMediaUrl(photo.url)}
                      width={44}
                    />
                  ) : (
                    <span className="bg-chip text-club grid size-11 place-items-center rounded-full text-meta font-extrabold">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-meta font-extrabold">{item.name}</span>
                    {item.role && (
                      <span className="text-faint block text-caption font-semibold">
                        {item.role}
                      </span>
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
