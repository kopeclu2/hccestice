import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { fetchSeason, seasonShortLabel } from '@/landing/features/matches/data/seasons'
import { fetchSponsors } from '@/landing/features/sponsors/data'
import type { Sponsor } from '@/landing/features/sponsors/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { internalArrow, MoreLink } from '@/landing/ui/MoreLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { countLabel } from '@/lib/plural'
import { cn } from '@/lib/utils'
import type { LandingSponsorsBlock } from '@/payload-types'

const PARTNER_FORMS: [string, string, string] = ['partner', 'partneři', 'partnerů']

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
 * koncem) a pod ním statická mřížka log sponzorů. Sekce je bez karty, loga
 * jsou bílé dlaždice na pozadí stránky; plný výpis je na `/sponzori`.
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

  return (
    <SectionShell id="sponzori">
      <Reveal>
        <div className="max-w-208">
          <SectionTitle size="lg">
            {titleStart ? `${titleStart} ` : ''}
            <Highlight dot>{titleHighlight}</Highlight>
          </SectionTitle>
          <div className="mt-6.5 flex flex-wrap items-center gap-x-2.5 gap-y-3">
            {/* Hlavní tlačítko sekce je výpis partnerů; „podpořit klub“ je
                textový odkaz — formulář na homepage má být jediné primární
                kontaktní místo. */}
            <MoreLink href="/sponzori">Všichni partneři</MoreLink>
            <Button
              asChild
              className="h-11 text-ink underline decoration-lime decoration-2 underline-offset-4"
              arrowIcon={internalArrow}
              size="clear"
              variant="link"
              withArrow
            >
              <Link href="#kontakt">{ctaLabel}</Link>
            </Button>
            <span className="text-sm font-medium text-faint">{count}</span>
          </div>
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
