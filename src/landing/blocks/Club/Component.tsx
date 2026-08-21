import type { LandingClubBlock } from '@/payload-types'

import React from 'react'

import { DotGrid, PlusMark } from '../../components/Decorations'
import { SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { CLUB } from '../../content'
import { uploadToPhoto } from '../../data/format'
import type { ClubContent } from '../../types'

/** Block data → view-model (fallbacky na content.ts). */
function mapClub(block: LandingClubBlock): ClubContent {
  return {
    kicker: block.kicker ?? CLUB.kicker,
    headlineStart: block.headlineStart ?? CLUB.headlineStart,
    headlineHighlight: block.headlineHighlight ?? CLUB.headlineHighlight,
    perex: block.perex ?? CLUB.perex,
    ctaLabel: block.ctaLabel ?? CLUB.cta.label,
    stadium: {
      photo: uploadToPhoto(block.stadium?.photo),
      tag: block.stadium?.tag ?? CLUB.cards.stadium.tag,
      caption: block.stadium?.caption ?? CLUB.cards.stadium.caption,
    },
    youth: {
      photo: uploadToPhoto(block.youth?.photo),
      tag: block.youth?.tag ?? CLUB.cards.youth.tag,
      caption: block.youth?.caption ?? CLUB.cards.youth.caption,
    },
    note: block.note ?? CLUB.cards.note,
  }
}

export function ClubBlockComponent({ block }: { block: LandingClubBlock }) {
  return <ClubView content={mapClub(block)} />
}

/**
 * O klubu — intro text s CTA vlevo, vpravo fotokarty stadionu
 * a mládeže s overlay popisky. Watermark „ČESTICE" na pozadí.
 */
function ClubView({ content }: { content: ClubContent }) {
  return (
    <SectionShell
      /* Dva sloupce až od `md`: `minmax(21.25rem,…)` je tvrdé minimum 340px,
         takže na 320px šířce sloupec přerostl kontejner a text i fotokarty
         se odřízly. Na `md` (768px) se auto-fit stejně vejde jen jeden
         sloupec, takže desktopová kompozice zůstává nedotčená. */
      className="grid grid-cols-1 items-start gap-9 md:grid-cols-[repeat(auto-fit,minmax(21.25rem,1fr))] md:gap-14"
      id="klub"
    >
      <Watermark
        className="text-ink/4 -left-10 bottom-7 text-watermark-md tracking-[-0.06em]"
        outlined={false}
      >
        ČESTICE
      </Watermark>
      <DotGrid className="left-0 top-30 size-75" maskPosition="20% 30%" />
      <PlusMark className="left-82 top-15" />

      <Reveal>
        <Kicker>{content.kicker}</Kicker>
        <SectionTitle className="mt-5" size="lg">
          {content.headlineStart} <Highlight>{content.headlineHighlight}</Highlight>.
        </SectionTitle>
        <p className="text-dim mt-4 mb-6.5 leading-relaxed text-pretty">{content.perex}</p>
        <PillLink href="#kontakt" variant="dark" withArrow>
          {content.ctaLabel}
        </PillLink>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-5.5">
          <PhotoTile
            className="h-82.5 rounded-block"
            photo={content.stadium.photo}
            sizes="(max-width: 48rem) 100vw, 25vw"
          >
            <TileBadge className="top-3.5 left-3.5">{content.stadium.tag}</TileBadge>
            <div className="absolute bottom-4 left-4 right-15 text-body leading-normal font-semibold text-white">
              {content.stadium.caption}
            </div>
          </PhotoTile>

          <div className="flex flex-col gap-4">
            <PhotoTile
              className="h-52.5 rounded-block"
              photo={content.youth.photo}
              sizes="(max-width: 48rem) 100vw, 25vw"
            >
              <TileBadge className="top-3 left-3">{content.youth.tag}</TileBadge>
              <div className="absolute bottom-3.5 left-3.5 text-body font-semibold text-white">
                {content.youth.caption}
              </div>
            </PhotoTile>
            <p className="text-dim text-meta leading-normal text-pretty">{content.note}</p>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
