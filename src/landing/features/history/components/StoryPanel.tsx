import React from 'react'

import { HISTORY_PAGE } from '@/landing/content'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Watermark } from '@/landing/ui/Watermark'

/**
 * Vypíchnutý příběh „dresy na dluh" — zelená karta s watermarkem HCČ,
 * bílým šrafováním, lime kickerem a lime zvýrazněním v titulku.
 */
export function StoryPanel() {
  const { story } = HISTORY_PAGE

  return (
    <div>
      <div className="relative overflow-hidden rounded-section bg-club px-4.5 py-6 text-on-contrast md:px-7.5 md:py-8 lg:px-12 lg:py-11">
        <Watermark className="-right-7.5 -bottom-12.5 text-watermark-sm tracking-display text-on-contrast-glass">
          HCČ
        </Watermark>
        <div className="pointer-events-none absolute inset-0 hatch-white" />

        <Eyebrow className="relative" tone="lime" wide>
          {story.kicker}
        </Eyebrow>
        <CardTitle className="relative mt-3 max-w-160 leading-tight text-pretty" size="lg">
          {story.headlineStart}
          <span className="bg-lime box-decoration-clone px-2 text-ink">
            {story.headlineHighlight}
          </span>
          {story.headlineEnd}
        </CardTitle>
        <p className="relative mt-3 max-w-140 text-sm leading-[1.6] text-pretty text-on-contrast-soft">
          {story.text}
        </p>
      </div>
    </div>
  )
}
