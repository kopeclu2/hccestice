import type { CtaBannerBlockType } from '@/payload-types'

import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { SectionTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { uploadToPhoto } from '../../data/format'

/** CTA banner — zelená/tmavá karta s titulkem a tlačítkem (vzor brigáda). */
export function CtaBannerBlockComponent({ block }: { block: CtaBannerBlockType }) {
  const photo = uploadToPhoto(block.photo)
  return (
    <SectionShell>
      <Reveal>
        <div
          className={cn(
            'relative overflow-hidden rounded-card p-8 text-white md:p-12',
            block.tone === 'dark' ? 'bg-contrast' : 'bg-club',
          )}
        >
          {photo && (
            <Image
              alt=""
              aria-hidden
              className="absolute inset-0 size-full object-cover opacity-20"
              fill
              sizes="100vw"
              src={getMediaUrl(photo.url)}
            />
          )}
          <div className="relative max-w-150">
            {block.kicker && <Eyebrow tone="lime">{block.kicker}</Eyebrow>}
            <SectionTitle className="mt-1.5 text-pretty">{block.title}</SectionTitle>
            {block.text && <p className="mt-3 text-white/85">{block.text}</p>}
            {block.ctaLabel && block.ctaHref && (
              <PillLink className="mt-6" href={block.ctaHref} variant="light" withArrow>
                {block.ctaLabel}
              </PillLink>
            )}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
