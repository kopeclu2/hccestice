import type { LandingSponsorsBlock } from '@/payload-types'

import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import { GlowCircle } from '../../components/Decorations'
import { SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { countLabel } from '../../data/format'
import { fetchSeason, seasonShortLabel } from '../../data/seasons'
import { fetchSponsors } from '../../data/sponsors'
import type { Sponsor } from '../../types'

const PARTNER_FORMS: [string, string, string] = ['partner', 'partneři', 'partnerů']

const DEFAULT_TITLE = 'Klub drží nad vodou naši partneři'

/** Od tolika partnerů se pás rozdělí na dvě protijezdné řady. */
const TWO_ROWS_FROM = 8

/**
 * Rozdělení nadpisu na běžnou a lime zvýrazněnou část (vzor sekce O klubu).
 * Bez vyplněné zvýrazněné části se vezmou poslední dvě slova nadpisu —
 * starší obsah v CMS má celý nadpis v jednom poli.
 */
function splitHeadline(title: string, highlight?: string | null): [string, string] {
  const wanted = highlight?.trim()
  if (wanted) {
    const start = title.trim().endsWith(wanted)
      ? title.trim().slice(0, -wanted.length)
      : `${title.trim()} `
    return [start.trim(), wanted]
  }

  const words = title.trim().split(/\s+/)
  if (words.length < 3) return ['', title.trim()]
  return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')]
}

/** Partneři: aktivní sponzoři z kolekce, nadpis a CTA z bloku. */
export async function SponsorsBlockComponent({ block }: { block: LandingSponsorsBlock }) {
  const [sponsors, season] = await Promise.all([fetchSponsors(), fetchSeason(null)])
  const count = countLabel(sponsors.length, PARTNER_FORMS)
  const [titleStart, titleHighlight] = splitHeadline(
    block.title?.trim() || DEFAULT_TITLE,
    block.titleHighlight,
  )
  return (
    <SponsorsView
      count={season ? `${count} v sezóně ${seasonShortLabel(season)}` : count}
      ctaLabel={block.ctaLabel ?? undefined}
      sponsors={sponsors}
      titleHighlight={titleHighlight}
      titleStart={titleStart}
    />
  )
}

/**
 * Partneři — nadpis ve stylu sekce O klubu (kicker + velký titulek s lime
 * koncem) a pod ním nekonečné marquee log sponzorů (CSS animace, pauza
 * na hover). Sekce je bez karty, loga jsou bílé dlaždice na pozadí stránky.
 *
 * Každá řada se rendruje dvakrát za sebou a animace posouvá pás o −50 % —
 * tím vzniká plynulá smyčka bez skoku. Od `TWO_ROWS_FROM` partnerů jsou
 * řady dvě a jedou proti sobě, aby pás nebyl monotónní. Okraje pásu maskuje
 * fade, `prefers-reduced-motion` animaci zastaví.
 */
function SponsorsView({
  sponsors,
  count,
  titleStart,
  titleHighlight,
  ctaLabel = 'Chci podpořit klub',
}: {
  sponsors: Sponsor[]
  count: string
  titleStart: string
  titleHighlight: string
  ctaLabel?: string
}) {
  if (sponsors.length === 0) return null

  const half = Math.ceil(sponsors.length / 2)
  const rows =
    sponsors.length >= TWO_ROWS_FROM ? [sponsors.slice(0, half), sponsors.slice(half)] : [sponsors]

  return (
    <SectionShell id="sponzori">
      <GlowCircle className="-left-60 -top-40 size-180" tone="club" />
      <GlowCircle className="-right-50 -bottom-50 size-160" tone="lime" />

      <Reveal>
        <div className="max-w-208">
          <Kicker>Partneři</Kicker>
          <SectionTitle className="mt-5" size="lg">
            {titleStart ? `${titleStart} ` : ''}
            <Highlight>{titleHighlight}</Highlight>.
          </SectionTitle>
          <div className="mt-6.5 flex flex-wrap items-center gap-x-2.5 gap-y-3">
            <PillLink href="#kontakt" variant="dark" withArrow>
              {ctaLabel}
            </PillLink>
            <PillLink href="/sponzori" variant="outline" withArrow>
              Všichni partneři
            </PillLink>
            <span className="text-faint text-meta font-semibold">{count}</span>
          </div>
        </div>
      </Reveal>

      {/* pás log přes celou šířku sekce (bez vnitřního odsazení) */}
      <Reveal delay={0.1}>
        <div className="-mx-[clamp(0.875rem,3vw,2.5rem)] mt-11 flex flex-col gap-3.5 md:mt-13">
          {rows.map((row, index) => (
            <MarqueeRow key={index} reverse={index % 2 === 1} sponsors={row} />
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}

/**
 * Jedna řada pásu — duplikovaný seznam log v nekonečné smyčce.
 *
 * `overflow-hidden` (nutné pro smyčku) by ořízl nadzvednutí a stín dlaždice
 * na hover, proto má řada svislou výplň a stejně velký negativní margin —
 * hover má kam vyjet, ale rytmus sekce zůstává.
 */
function MarqueeRow({ sponsors, reverse }: { sponsors: Sponsor[]; reverse: boolean }) {
  return (
    <div className="-my-5 overflow-hidden py-5 [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]">
      <div
        className={cn(
          'flex w-max gap-3.5 hover:[animation-play-state:paused] motion-reduce:animate-none',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
        )}
      >
        {[...sponsors, ...sponsors].map((sponsor, index) => (
          <SponsorTile key={`${sponsor.id}-${index}`} sponsor={sponsor} />
        ))}
      </div>
    </div>
  )
}

/**
 * Dlaždice partnera — bílá karta na tónovaném pásu. Logo je ve výchozím
 * stavu odbarvené (loga mají různě pestré podklady, v řadě se pak
 * neruší), na hover se rozsvítí a dlaždice se nadzvedne.
 */
function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const content = sponsor.logo ? (
    <Image
      alt={sponsor.name}
      className="max-h-13 w-auto max-w-37.5 object-contain grayscale transition duration-300 group-hover:grayscale-0"
      height={56}
      src={getMediaUrl(sponsor.logo.url)}
      width={150}
    />
  ) : (
    <span>{sponsor.name}</span>
  )

  const className =
    'group border-line-soft hover:border-club hover:shadow-tile grid h-22 min-w-47.5 flex-none place-items-center rounded-badge border bg-surface px-6.5 text-body font-extrabold tracking-tight whitespace-nowrap transition duration-200 hover:-translate-y-0.5'

  return sponsor.url ? (
    <a
      className={className}
      href={sponsor.url}
      rel="noreferrer"
      target="_blank"
      title={sponsor.name}
    >
      {content}
    </a>
  ) : (
    <span className={className} title={sponsor.name}>
      {content}
    </span>
  )
}
