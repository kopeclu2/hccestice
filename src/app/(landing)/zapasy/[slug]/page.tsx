import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import React from 'react'

import { cn } from '@/utilities/ui'

import { Breadcrumbs } from '@/landing/components/Breadcrumbs'
import { PillLink } from '@/landing/components/PillLink'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchMatchDetail, fetchMatchSlugs } from '@/landing/data/matchDetail'
import { matchDescription, matchHeadline } from '@/landing/data/matchDetailView'
import { formatFullDate } from '@/landing/data/format'
import type { MatchDetail } from '@/landing/types'
import { MatchHeader } from '@/landing/zapas/MatchHeader'
import { MatchJsonLd } from '@/landing/zapas/MatchJsonLd'
import { MatchReportCard } from '@/landing/zapas/MatchReportCard'
import { MatchTimeline } from '@/landing/zapas/MatchTimeline'
import { brandTitle } from '@/utilities/brandTitle'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph, OG_FALLBACK_IMAGE } from '@/utilities/mergeOpenGraph'

/**
 * ISR pojistka pro HTML; data jdou přes tagovanou `unstable_cache`
 * (`matches-list` + `posts-list`), takže změna zápasu nebo reportáže
 * v adminu stránku obnoví hned a 600 s je jen záchranná síť.
 */
export const revalidate = 600

export async function generateStaticParams() {
  const slugs = await fetchMatchSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

/**
 * Slug z URL, nebo `null` při neplatném procentovém kódování. Next
 * parametry někdy předá ještě zakódované, ale `decodeURIComponent` na
 * `%zz` vyhodí `URIError` (→ HTTP 500), proto se chyba mění na 404.
 * Slugy zápasů jsou `[a-z0-9-]`, takže dvojí dekódování nevadí.
 */
const readSlug = async ({ params }: Args): Promise<string | null> => {
  const { slug } = await params
  try {
    return decodeURIComponent(slug)
  } catch {
    return null
  }
}

/**
 * `sizes` fotky reportáže kopírují layout stránky: s časovou osou je karta
 * v pravém sloupci mřížky (0.85fr z ~1320 px), bez ní je jediná a má
 * strop `lg:max-w-[48rem]` — viz `MatchReportCard` a mřížku níž.
 */
const REPORT_SIZES_SPLIT = '(max-width: 1023px) 100vw, 40vw'
const REPORT_SIZES_SINGLE = '(max-width: 1023px) 100vw, 48rem'

/** Cesta zpět do výpisu na sezónu zápasu (a jeho sekci). */
const listHref = (match: MatchDetail): string => {
  const season = match.seasonSlug ? `?sezona=${encodeURIComponent(match.seasonSlug)}` : ''
  return `/zapasy${season}#${match.status === 'played' ? 'odehrane' : 'rozlosovani'}`
}

/**
 * Detail zápasu — časová osa ve stylu Livesportu (góly a tresty HC Čestice,
 * góly soupeře jen jako stav), vedle ní Reportáž a galerie. Handoff pro
 * něj neexistuje, drží se vizuální jazyk `/zapasy` a hero reportáže.
 *
 * Neznámý slug je `notFound()`, ne `PayloadRedirects`: žádný legacy
 * redirect na `/zapasy/*` nikdy neexistoval, takže by hledání v kolekci
 * redirectů nemělo co najít. `loading.tsx` výpisu leží v `(vypis)`, takže
 * nad touhle routou žádná Suspense boundary nestojí a `notFound()` vrací
 * skutečné HTTP 404 (viz komentář v `(vypis)/loading.tsx`).
 */
export default async function MatchDetailPage(args: Args) {
  const slug = await readSlug(args)
  const match = slug ? await fetchMatchDetail(slug) : null
  if (!match) notFound()

  const hasTimeline = match.timeline.length > 0
  // Statistika na detailu není (rozhodnutí uživatele 14. 10. 2026), takže
  // vedle osy zbývá jen reportáž a galerie.
  const hasAside = Boolean(match.report || match.gallery)
  const split = hasTimeline && hasAside
  const opponentName = match.weAreHome ? match.awayName : match.homeName

  return (
    <SubpageShell pattern={{ variant: 'grid', tone: 'club', fade: 'top-right' }}>
      <MatchJsonLd match={match} />

      <SectionShell spacing="header">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Breadcrumbs
            className="mb-0"
            trail={[{ href: '/zapasy', label: 'Zápasy' }, { label: match.title }]}
          />
          <PillLink href={listHref(match)} size="sm" variant="outline">
            ← Všechny zápasy
          </PillLink>
        </div>
      </SectionShell>

      <SectionShell spacing="bar">
        <MatchHeader match={match} />
      </SectionShell>

      {match.missingProtocol && (
        <SectionShell spacing="split">
          <p className="border-line-mid text-ink-soft rounded-section border border-dashed bg-surface p-4.5 text-body font-semibold text-pretty md:p-7 lg:p-9">
            Podrobný zápis z utkání není k dispozici.
          </p>
        </SectionShell>
      )}

      {(hasTimeline || hasAside) && (
        <SectionShell
          className={cn(
            'grid grid-cols-1 items-start gap-[clamp(1.25rem,3vw,2.5rem)]',
            split && 'lg:grid-cols-[1.15fr_0.85fr]',
          )}
          spacing="split"
        >
          {/* Levý sloupec je průběh zápasu, pravý reportáž a galerie.
              Prázdný sloupec se nevykreslí vůbec, aby mřížka nenechala díru;
              osa bez reportáže dostane stejný strop šířky jako samotná
              reportáž, jinak by se řádky roztáhly přes 1320 px. */}
          {hasTimeline && (
            <div className={cn('min-w-0', !split && 'lg:max-w-[min(100%,48rem)]')}>
              <MatchTimeline
                goalsOurs={match.goalsOurs}
                opponentName={opponentName}
                penaltyMinutes={match.penaltyMinutes}
                periods={match.timeline}
              />
            </div>
          )}
          {/* Bez osy (starší sezóny) zbývá jen jeden sloupec — bez stropu šířky
              by se karta reportáže roztáhla přes celých 1320 px. */}
          {hasAside && (
            <div className={cn('min-w-0', !split && 'lg:max-w-[min(100%,48rem)]')}>
              <MatchReportCard
                gallery={match.gallery}
                report={match.report}
                sizes={split ? REPORT_SIZES_SPLIT : REPORT_SIZES_SINGLE}
              />
            </div>
          )}
        </SectionShell>
      )}

      {/* Druhý odkaz zpět jen pod delším obsahem. Naplánovaný zápas končí
          hlavičkou, takže by stál osamocený pod velkou mezerou a zdvojoval
          tlačítko o kus výš. */}
      {(hasTimeline || hasAside || match.missingProtocol) && (
        <SectionShell spacing="cta">
          <PillLink href={listHref(match)} size="md" variant="outline">
            ← Všechny zápasy
          </PillLink>
        </SectionShell>
      )}
    </SubpageShell>
  )
}

/**
 * Titulek: „HC Čestice 5:3 HC Zdar · 12. 10. 2025" (pořadí domácí : hosté),
 * u zápasu bez výsledku „HC Čestice × HC Zdar · 12. 10. 2025". Suffix
 * „| HC Čestice" řeší `brandTitle` idempotentně — jméno klubu v titulku už
 * je, takže se nezdvojí (stejně jako u zápasových reportáží).
 *
 * `openGraph` a `twitter` se dosazují vlastní, ne zděděné z layoutu: Next
 * slučuje metadata mělce, takže sdílená karta by jinak nesla titulek webu.
 */
export async function generateMetadata(args: Args): Promise<Metadata> {
  const slug = await readSlug(args)
  const match = slug ? await fetchMatchDetail(slug) : null
  if (!slug || !match) return { title: 'Zápas nenalezen | HC Čestice' }

  const title = brandTitle(`${matchHeadline(match)} · ${formatFullDate(match.kickoffISO)}`)
  const description = matchDescription(match)
  const url = `${getServerSideURL()}/zapasy/${slug}`

  // Fotka z reportáže je jediný obrázek, který o zápase něco říká; `getMediaUrl`
  // s `updatedAt` drží verzi v URL (viz AGENTS.md → Média). Bez ní zbývá logo
  // klubu — čtvercové, takže `summary` místo `summary_large_image`, jinak by
  // ho sítě ořízly nebo roztáhly.
  const photo = match.report?.photo
  const images = [
    {
      url: photo
        ? `${getServerSideURL()}${getMediaUrl(photo.url, photo.updatedAt)}`
        : `${getServerSideURL()}${OG_FALLBACK_IMAGE}`,
    },
  ]

  return {
    title,
    description,
    alternates: { canonical: `/zapasy/${slug}` },
    openGraph: mergeOpenGraph({ description, images, title, url }),
    twitter: { card: photo ? 'summary_large_image' : 'summary', description, images, title },
  }
}
