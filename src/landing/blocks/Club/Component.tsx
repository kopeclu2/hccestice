import React from 'react'

import { DotGrid, PlusMark } from '@/landing/ui/Decorations'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { PhotoTile, TileBadge } from '@/landing/ui/PhotoTile'
import { PillLink } from '@/landing/ui/PillLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'
import type { LandingClubBlock } from '@/payload-types'

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
      className="grid grid-cols-1 items-start gap-9 md:grid-cols-[repeat(auto-fit,minmax(min(21.25rem,100%),1fr))] md:gap-14"
      id="klub"
    >
      <Watermark
        className="bottom-7 -left-10 text-watermark-md tracking-[-0.06em] text-ink/4"
        outlined={false}
      >
        ČESTICE
      </Watermark>
      <DotGrid className="top-30 left-0 size-75" maskPosition="20% 30%" />
      <PlusMark className="top-15 left-82" />

      <Reveal>
        <Kicker>{content.kicker}</Kicker>
        <SectionTitle className="mt-5" size="lg">
          {content.headlineStart} <Highlight dot>{content.headlineHighlight}</Highlight>
        </SectionTitle>
        <p className="mt-4 mb-6.5 leading-relaxed text-pretty text-dim">{content.perex}</p>
        <PillLink href="#kontakt" variant="dark" withArrow>
          {content.ctaLabel}
        </PillLink>
      </Reveal>

      <Reveal delay={0.1}>
        {/* `sizes` kopíruje zlomy mřížky: do 768px je dlaždice na celou šířku,
            mezi 768 a 1024px si auto-fit rozdělí sloupec na polovinu a až na
            desktopu je z ní čtvrtina viewportu. Jediný zlom na 48rem tahal na
            tablet 192px fotku do ~350px dlaždice. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(15rem,100%),1fr))] gap-5.5">
          <PhotoTile
            className="h-82.5 rounded-block"
            photo={content.stadium.photo}
            sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 25vw"
          >
            <TileBadge className="top-3.5 left-3.5">{content.stadium.tag}</TileBadge>
            <div className="absolute right-15 bottom-4 left-4 text-sm leading-normal font-medium text-white md:text-base">
              {content.stadium.caption}
            </div>
          </PhotoTile>

          <div className="flex flex-col gap-4">
            <PhotoTile
              className="h-52.5 rounded-block"
              photo={content.youth.photo}
              sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 25vw"
            >
              <TileBadge className="top-3 left-3">{content.youth.tag}</TileBadge>
              <div className="absolute bottom-3.5 left-3.5 text-sm font-medium text-white md:text-base">
                {content.youth.caption}
              </div>
            </PhotoTile>
            <p className="text-sm leading-normal text-pretty text-dim">{content.note}</p>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
