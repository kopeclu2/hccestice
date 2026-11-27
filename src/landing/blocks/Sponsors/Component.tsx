import Image from 'next/image'
import React from 'react'

import { fetchSponsors } from '@/landing/features/sponsors/data'
import type { Sponsor } from '@/landing/features/sponsors/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { MoreLink } from '@/landing/ui/MoreLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { cn } from '@/lib/utils'
import type { LandingSponsorsBlock } from '@/payload-types'

const DEFAULT_TITLE = 'Klub drží nad vodou naši partneři'

/** Kolik partnerů ukáže homepage; všichni jsou na `/sponzori`. */
const HOME_SPONSORS = 12

/** Od `md` jsou vidět všechna loga mřížky, pod ním jen první dvě řady. */
const MOBILE_SPONSORS = 8

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
  const sponsors = await fetchSponsors()
  const [titleStart, titleHighlight] = splitHeadline(
    block.title?.trim() || DEFAULT_TITLE,
    block.titleHighlight,
  )
  return (
    <SponsorsView sponsors={sponsors} titleHighlight={titleHighlight} titleStart={titleStart} />
  )
}

/**
 * Partneři — nadpis ve stylu sekce O klubu (kicker + velký titulek s lime
 * koncem) a pod ním statická mřížka log sponzorů. Sekce je bez karty, loga
 * jsou bílé dlaždice na pozadí stránky; plný výpis je na `/sponzori`.
 */
function SponsorsView({
  sponsors,
  titleStart,
  titleHighlight,
}: {
  sponsors: Sponsor[]
  titleStart: string
  titleHighlight: string
}) {
  if (sponsors.length === 0) return null

  return (
    <SectionShell id="sponzori">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <SectionTitle className="max-w-208" size="lg">
            {titleStart ? `${titleStart} ` : ''}
            <Highlight dot>{titleHighlight}</Highlight>
          </SectionTitle>
          <MoreLink href="/sponzori">Všichni partneři</MoreLink>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-11 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:mt-13 lg:grid-cols-4 xl:grid-cols-6">
          {sponsors.slice(0, HOME_SPONSORS).map((sponsor, index) => (
            <SponsorTile
              className={cn(index >= MOBILE_SPONSORS && 'max-md:hidden')}
              key={sponsor.id}
              sponsor={sponsor}
            />
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}

/**
 * Dlaždice partnera — bílá karta v mřížce. Loga jsou barevná; na hover se
 * dlaždice nadzvedne.
 */
function SponsorTile({ sponsor, className }: { sponsor: Sponsor; className?: string }) {
  const content = sponsor.logo ? (
    <Image
      alt={sponsor.name}
      className="max-h-13 w-auto max-w-full object-contain"
      height={56}
      src={getMediaUrl(sponsor.logo.url, sponsor.logo.updatedAt)}
      width={150}
    />
  ) : (
    <span>{sponsor.name}</span>
  )

  const tileClass = cn(
    'group grid h-22 place-items-center rounded-badge border border-line-soft bg-surface px-5 text-center text-sm font-bold tracking-tight transition duration-200 hover:-translate-y-0.5 hover:border-club hover:shadow-tile md:text-base',
    className,
  )

  return sponsor.url ? (
    <a
      className={tileClass}
      href={sponsor.url}
      rel="noreferrer"
      target="_blank"
      title={sponsor.name}
    >
      {content}
    </a>
  ) : (
    <span className={tileClass} title={sponsor.name}>
      {content}
    </span>
  )
}
