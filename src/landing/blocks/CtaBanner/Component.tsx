import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { uploadToPhoto } from '@/landing/lib/media'
import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'
import type { CtaBannerBlockType } from '@/payload-types'

/** CTA banner — zelená/tmavá karta s titulkem a tlačítkem (vzor brigáda). */
export function CtaBannerBlockComponent({ block }: { block: CtaBannerBlockType }) {
  const photo = uploadToPhoto(block.photo)
  return (
    <SectionShell>
      <Reveal>
        <div
          className={cn(
            'relative overflow-hidden rounded-card p-8 text-on-contrast md:p-10 lg:p-12',
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
              src={getMediaUrl(photo.url, photo.updatedAt)}
            />
          )}
          <div className="relative max-w-150">
            {block.kicker && <Eyebrow tone="lime">{block.kicker}</Eyebrow>}
            <SectionTitle className="mt-1.5 text-pretty">{block.title}</SectionTitle>
            {block.text && <p className="mt-3 text-on-contrast-strong">{block.text}</p>}
            {block.ctaLabel && block.ctaHref && (
              <Button asChild className="mt-6" variant="light" withArrow>
                <Link href={block.ctaHref}>{block.ctaLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
