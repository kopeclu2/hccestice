import type { LandingHistoryBlock } from '@/payload-types'

import React from 'react'

import { Badge } from '../../components/Badge'
import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { Watermark } from '../../components/Watermark'
import { HISTORY } from '../../content'
import { arrayOr } from '../../data/format'
import type { HistoryContent } from '../../types'

/** Interní routy, na které sekce odkazuje (v CMS se edituje jen text tlačítek). */
const HISTORY_HREF = '/historie-klubu'
const PHOTOS_HREF = '/fotogalerie'

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

export function HistoryBlockComponent({ block }: { block: LandingHistoryBlock }) {
  return <HistoryView content={mapHistory(block)} />
}

/**
 * Historie — sekce bez karty ve stylu Partnerů: outlined watermark „1954",
 * štítek, velký nadpis s lime koncem a řádek dvou CTA se šedou metou.
 * Pod tím dvousloupec — vlevo vyprávění s pilulkami milníků, vpravo citát
 * z kroniky (lime uvozovka, zdroj pod silnou tmavou linkou).
 */
function HistoryView({ content }: { content: HistoryContent }) {
  return (
    <SectionShell id="historie">
      <Watermark className="text-club/10 -top-20 -right-7.5 text-watermark-2xl tracking-[-0.06em]">
        {content.watermark}
      </Watermark>

      <Reveal>
        <Kicker>{content.kicker}</Kicker>
        {/* stejná škála jako nadpisy ostatních sekcí (O klubu, Partneři) */}
        <SectionTitle className="mt-5 max-w-208" size="lg">
          {content.headlineStart} <Highlight>{content.headlineHighlight}</Highlight>.
        </SectionTitle>

        <div className="mt-7.5 flex flex-wrap items-center gap-x-3.5 gap-y-3">
          <PillLink href={HISTORY_HREF} variant="dark" withArrow>
            {content.ctaLabel}
          </PillLink>
          <PillLink href={PHOTOS_HREF} variant="outline" withArrow>
            {content.photosCtaLabel}
          </PillLink>
          <span className="text-faint text-meta font-semibold">{content.metaLine}</span>
        </div>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 items-center gap-[clamp(1.5rem,4vw,4rem)] md:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          {/* perex i doplňkový odstavec drží stejnou škálu jako hlavičky podstránek */}
          <p className="text-ink-soft text-lead leading-[1.55] text-pretty">{content.lead}</p>
          <p className="text-dim mt-4 leading-relaxed text-pretty">{content.text}</p>

          <div className="mt-6.5 flex flex-wrap items-center gap-2">
            {content.chips.map((chip) => (
              <Badge key={chip.label} size="md" variant={chip.accent ? 'lime' : 'outline'}>
                {chip.label}
              </Badge>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="relative m-0 flex flex-col justify-center px-[clamp(0rem,1vw,0.625rem)]">
            <span
              aria-hidden
              className="text-lime text-watermark-xs leading-[0.55] font-extrabold select-none"
            >
              „
            </span>
            <blockquote className="m-0">
              <CardTitle as="h4" className="mt-2.5" size="sm">
                {content.quoteStart} <Highlight>{content.quoteHighlight}</Highlight>
                {content.quoteEnd}
              </CardTitle>
            </blockquote>
            <figcaption className="text-faint border-contrast mt-5 max-w-80 border-t-2 pt-4 text-meta font-semibold">
              {content.quoteSource}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </SectionShell>
  )
}
