import React from 'react'

import { HISTORY } from '@/landing/content'
import { fetchHistoryEras } from '@/landing/features/history/data'
import type { HistoryContent } from '@/landing/features/history/types'
import { arrayOr } from '@/landing/lib/payload'
import type { Photo } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { MoreLink } from '@/landing/ui/MoreLink'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import { Reveal } from '@/landing/ui/Reveal'
import { FaceoffCircle } from '@/landing/ui/RinkMarkings'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { LandingHistoryBlock } from '@/payload-types'

/** Interní route, na kterou sekce odkazuje (v CMS se edituje jen text odkazu). */
const HISTORY_HREF = '/historie-klubu'

/** Block data → view-model (fallbacky na content.ts). */
function mapHistory(block: LandingHistoryBlock): HistoryContent {
  return {
    kicker: block.kicker ?? HISTORY.kicker,
    watermark: block.watermark ?? HISTORY.watermark,
    headlineStart: block.headlineStart ?? HISTORY.headlineStart,
    headlineHighlight: block.headlineHighlight ?? HISTORY.headlineHighlight,
    lead: block.lead ?? HISTORY.lead,
    text: block.text ?? HISTORY.text,
    metaLine: block.metaLine ?? HISTORY.metaLine,
    ctaLabel: block.ctaLabel ?? HISTORY.ctaLabel,
    photosCtaLabel: block.photosCtaLabel ?? HISTORY.photosCtaLabel,
    chips: arrayOr(block.chips, [...HISTORY.chips], (chip) => ({
      label: chip.label,
      accent: Boolean(chip.accent),
    })),
    quoteStart: block.quote?.start ?? HISTORY.quoteStart,
    quoteHighlight: block.quote?.highlight ?? HISTORY.quoteHighlight,
    quoteEnd: block.quote?.end ?? HISTORY.quoteEnd,
    quoteSource: block.quote?.source ?? HISTORY.quoteSource,
  }
}

/**
 * Nejstarší milník s fotkou z `/historie-klubu` (éry jdou od nejstarší).
 * Bez fotky v CMS vlevo zůstane kruh s letopočtem.
 */
async function pickArchivePhoto(): Promise<Photo | null> {
  const eras = await fetchHistoryEras()
  for (const era of eras) {
    const milestone = era.milestones.find((item) => item.photo)
    if (milestone?.photo) return milestone.photo
  }
  return null
}

export async function HistoryBlockComponent({ block }: { block: LandingHistoryBlock }) {
  return <HistoryView content={mapHistory(block)} photo={await pickArchivePhoto()} />
}

/**
 * Historie — jiná kostra než ostatní sekce: vlevo nadpis, vyprávění
 * a jediný odkaz na celou historii (pilulky milníků, druhé tlačítko,
 * `metaLine` a citát se nekreslí — zůstávají v CMS), vpravo archivní fotka
 * z milníků, nebo bez ní letopočet založení uvnitř kruhu vhazování (štítek
 * sekce je jeho popisek). Na mobilu je médium pod textem.
 *
 * Citát má otevírací uvozovku v řádku s textem (lime, visí na začátku), ne
 * jako samostatný obří glyf — ten dřív zasahoval do prvního řádku citátu.
 */
function HistoryView({ content, photo }: { content: HistoryContent; photo: Photo | null }) {
  const media = photo ? (
    <PhotoTile
      className="mx-auto aspect-4/3 w-full max-w-88 rounded-thumb shadow-lift"
      gradient="bottom-soft"
      photo={photo}
      sizes="(max-width: 48rem) 100vw, 22rem"
    >
      <Badge className="absolute bottom-4 left-4" size="xs" variant="lime">
        {content.watermark}
      </Badge>
    </PhotoTile>
  ) : (
    <figure className="relative mx-auto grid aspect-square w-full max-w-72 place-items-center md:max-w-88">
      <FaceoffCircle className="absolute inset-0 size-full text-club/35" dot={false} />
      <figcaption className="relative flex flex-col items-center gap-2 text-center">
        <p className="text-score leading-none font-extrabold tracking-title-tight text-ink tabular-nums">
          {content.watermark}
        </p>
        <Eyebrow className="text-ink-soft" tone="faint">
          {content.kicker}
        </Eyebrow>
      </figcaption>
    </figure>
  )

  return (
    <SectionShell
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16"
      id="historie"
    >
      <div className="lg:order-1">
        <Reveal>
          <SectionTitle className="max-w-208" size="lg">
            {content.headlineStart}{' '}
            <Highlight dot marker>
              {content.headlineHighlight}
            </Highlight>
          </SectionTitle>
          {/* perex i doplňkový odstavec drží stejnou škálu jako hlavičky podstránek */}
          <p className="mt-6 text-lg leading-copy text-pretty text-ink-soft">{content.lead}</p>
          <p className="mt-4 leading-relaxed text-pretty text-dim">{content.text}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6">
            <MoreLink href={HISTORY_HREF}>{content.ctaLabel}</MoreLink>
          </div>
        </Reveal>
      </div>
      <div className="lg:order-2">
        <Reveal>{media}</Reveal>
      </div>
    </SectionShell>
  )
}
