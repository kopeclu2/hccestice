import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { fetchSiteConfig } from '@/landing/data/site'
import { MatchJsonLd } from '@/landing/features/matches/components/MatchJsonLd'
import { MatchReportCard } from '@/landing/features/matches/components/MatchReportCard'
import { MatchSummary } from '@/landing/features/matches/components/MatchSummary'
import { MatchTimeline } from '@/landing/features/matches/components/MatchTimeline'
import { fetchMatchDetail, fetchMatchSlugs } from '@/landing/features/matches/data/matchDetail'
import { MatchHeaderByVariant } from '@/landing/features/matches/header-variants'
import type { MatchDetail } from '@/landing/features/matches/types'
import { matchDescription, matchHeadline } from '@/landing/features/matches/view/matchDetailView'
import { buildMatchSummary } from '@/landing/features/matches/view/matchSummary'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { buildListUrl } from '@/landing/lib/listUrl'
import { Breadcrumbs } from '@/landing/ui/Breadcrumbs'
import { PillLink } from '@/landing/ui/PillLink'
import { SectionShell } from '@/landing/ui/SectionShell'
import { brandTitle } from '@/lib/brandTitle'
import { SITE_NAME } from '@/lib/club'
import { formatFullDate } from '@/lib/datetime'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { mergeOpenGraph, OG_FALLBACK_IMAGE } from '@/lib/mergeOpenGraph'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

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
 * v pravém sloupci mřížky (1fr z 2,5fr ~1320 px); bez ní je karta přes celou
 * šířku hlavičky a fotka v ní od `md` zabírá polovinu (`wide`).
 */
const REPORT_SIZES_SPLIT = '(max-width: 1023px) 100vw, 38vw'
const REPORT_SIZES_WIDE = '(max-width: 767px) 100vw, 50vw'

/** Cesta zpět do výpisu na sezónu zápasu (a jeho sekci). */
const listHref = (match: MatchDetail): string =>
  buildListUrl(routes.list.matches, {
    filters: { sezona: match.seasonSlug },
    hash: match.status === 'played' ? 'odehrane' : 'rozlosovani',
  })

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
  // Vzhled hlavičky volí správce v Nastavení webu. `siteConfig` je tagovaná
  // cache (`site-config`) a čte ji i `SubpageShell`, takže uložení v adminu
  // přegeneruje i prerenderované detaily (tag se propaguje do stránky).
  const site = await fetchSiteConfig()

  const hasTimeline = match.timeline.length > 0
  // Statistika na detailu není (rozhodnutí uživatele 14. 10. 2026). Vedle
  // osy stojí reportáž s galerií a souhrn (kanadské body, tresty), který
  // drží osu v užším sloupci — přes celých 1320 px byl stav po gólu daleko
  // od jména (rozhodnutí uživatele 15. 10. 2026).
  const summary = buildMatchSummary(match.timeline)
  const hasSummary = summary.points.length > 0 || summary.penalties.length > 0
  const hasReport = Boolean(match.report || match.gallery)
  const hasAside = hasReport || hasSummary
  const split = hasTimeline && hasAside
  const opponentName = match.weAreHome ? match.awayName : match.homeName

  return (
    <SubpageShell pattern={{ variant: 'grid', tone: 'club', fade: 'top-right' }}>
      <MatchJsonLd match={match} />

      <SectionShell spacing="header">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Breadcrumbs
            className="mb-0"
            trail={[{ href: routes.list.matches, label: 'Zápasy' }, { label: match.title }]}
          />
          <PillLink href={listHref(match)} size="sm" variant="outline">
            ← Všechny zápasy
          </PillLink>
        </div>
      </SectionShell>

      <SectionShell spacing="bar">
        <MatchHeaderByVariant match={match} variant={site.matchHeaderVariant} />
      </SectionShell>

      {match.missingProtocol && (
        <SectionShell spacing="split">
          <p className="rounded-section border border-dashed border-line-mid bg-surface p-4.5 text-sm font-medium text-pretty text-ink-soft md:p-7 md:text-base lg:p-9">
            Podrobný zápis z utkání není k dispozici.
          </p>
        </SectionShell>
      )}

      {(hasTimeline || hasAside) && (
        <SectionShell
          className={cn(
            'grid grid-cols-1 items-start gap-[clamp(1.25rem,3vw,2.5rem)]',
            split && 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]',
          )}
          spacing="split"
        >
          {/* Levý sloupec je průběh zápasu, pravý reportáž a souhrn.
              Prázdný sloupec se nevykreslí vůbec, aby mřížka nenechala díru;
              samotná reportáž (archiv bez zápisu) jde přes celou šířku
              hlavičky jako vodorovná karta. */}
          {hasTimeline && (
            <div className="min-w-0">
              <MatchTimeline
                goalsOurs={match.goalsOurs}
                opponentName={opponentName}
                penaltyMinutes={match.penaltyMinutes}
                periods={match.timeline}
              />
            </div>
          )}
          {hasAside && (
            <div className="flex min-w-0 flex-col gap-[clamp(1.25rem,3vw,2.5rem)]">
              <MatchReportCard
                gallery={match.gallery}
                report={match.report}
                sizes={split ? REPORT_SIZES_SPLIT : REPORT_SIZES_WIDE}
                wide={!split}
              />
              <MatchSummary summary={summary} />
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
  if (!slug || !match) return { title: `Zápas nenalezen | ${SITE_NAME}` }

  const title = brandTitle(`${matchHeadline(match)} · ${formatFullDate(match.kickoffISO)}`)
  const description = matchDescription(match)
  const url = `${getServerSideURL()}${routes.match(slug)}`

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
    alternates: { canonical: routes.match(slug) },
    openGraph: mergeOpenGraph({ description, images, title, url }),
    twitter: { card: photo ? 'summary_large_image' : 'summary', description, images, title },
  }
}
