import React from 'react'

import { HISTORY } from '@/landing/content'
import type { HistoryContent } from '@/landing/features/history/types'
import { arrayOr } from '@/landing/lib/payload'
import { Badge } from '@/landing/ui/Badge'
import { CardTitle, SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow, Highlight } from '@/landing/ui/Kicker'
import { MoreLink } from '@/landing/ui/MoreLink'
import { Reveal } from '@/landing/ui/Reveal'
import { FaceoffCircle } from '@/landing/ui/RinkMarkings'
import { SectionShell } from '@/landing/ui/SectionShell'
import { routes } from '@/lib/routes'
import type { LandingHistoryBlock } from '@/payload-types'

/** Interní routy, na které sekce odkazuje (v CMS se edituje jen text tlačítek). */
const HISTORY_HREF = '/historie-klubu'
const PHOTOS_HREF = routes.list.galleries

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
 * Historie — jiná kostra než ostatní sekce: vlevo letopočet založení uvnitř
 * kruhu vhazování (štítek sekce je jeho popisek), vpravo nadpis, vyprávění,
 * citát z kroniky a pilulky milníků. Letopočet je jediný „velký nápis“ na
 * homepage a nese údaj (rok založení z CMS), ne dekoraci.
 *
 * Citát má otevírací uvozovku v řádku s textem (lime, visí na začátku), ne
 * jako samostatný obří glyf — ten dřív zasahoval do prvního řádku citátu.
 */
function HistoryView({ content }: { content: HistoryContent }) {
  return (
    <SectionShell
      className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16"
      id="historie"
    >
      <Reveal>
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
      </Reveal>

      <div>
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
          <figure className="mt-8 max-w-176">
            <blockquote>
              <CardTitle as="h3" size="sm">
                <span aria-hidden className="text-lime">
                  „
                </span>
                {content.quoteStart} <Highlight>{content.quoteHighlight}</Highlight>
                {content.quoteEnd}
                <span aria-hidden className="text-lime">
                  “
                </span>
              </CardTitle>
            </blockquote>
            <figcaption className="mt-4 max-w-80 border-t-2 border-contrast pt-3 text-sm font-medium text-faint">
              {content.quoteSource}
            </figcaption>
          </figure>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {content.chips.map((chip) => (
              <Badge key={chip.label} size="md" variant={chip.accent ? 'lime' : 'outline'}>
                {chip.label}
              </Badge>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-3.5 gap-y-3">
            <MoreLink href={HISTORY_HREF}>{content.ctaLabel}</MoreLink>
            <MoreLink href={PHOTOS_HREF}>{content.photosCtaLabel}</MoreLink>
            <span className="text-sm font-medium text-faint">{content.metaLine}</span>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
