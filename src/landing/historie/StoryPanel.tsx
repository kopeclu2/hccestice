import React from 'react'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { Watermark } from '../components/Watermark'
import { HISTORY_PAGE } from '../content'

/**
 * Vypíchnutý příběh „dresy na dluh" — zelená karta s watermarkem HCČ,
 * bílým šrafováním, lime kickerem a lime zvýrazněním v titulku.
 */
export function StoryPanel() {
  const { story } = HISTORY_PAGE

  return (
    <div>
      <div className="bg-club relative overflow-hidden rounded-section px-4.5 py-6 text-white md:px-7.5 md:py-8 lg:px-12 lg:py-11">
        <Watermark className="-right-7.5 -bottom-12.5 text-watermark-sm tracking-[-0.06em] text-white/14">
          HCČ
        </Watermark>
        <div className="hatch-white pointer-events-none absolute inset-0" />

        <Eyebrow className="relative" tone="lime" wide>
          {story.kicker}
        </Eyebrow>
        <CardTitle className="relative mt-3 max-w-160 leading-[1.25] text-pretty" size="lg">
          {story.headlineStart}
          <span className="bg-lime text-ink box-decoration-clone px-2">
            {story.headlineHighlight}
          </span>
          {story.headlineEnd}
        </CardTitle>
        <p className="relative mt-3 max-w-140 text-meta leading-[1.6] text-white/80 text-pretty">
          {story.text}
        </p>
      </div>
    </div>
  )
}
