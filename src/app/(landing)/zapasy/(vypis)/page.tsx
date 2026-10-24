import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import { FixturesRail } from '@/landing/features/matches/components/FixturesRail'
import { FormStrip } from '@/landing/features/matches/components/FormStrip'
import { MatchesCta } from '@/landing/features/matches/components/MatchesCta'
import { MatchesHeader } from '@/landing/features/matches/components/MatchesHeader'
import { MatchesJsonLd } from '@/landing/features/matches/components/MatchesJsonLd'
import { ResultsList } from '@/landing/features/matches/components/ResultsList'
import { StandingsPanel } from '@/landing/features/matches/components/StandingsPanel'
import {
  fetchSeasonFixtures,
  fetchSeasonForm,
  fetchSeasonResults,
} from '@/landing/features/matches/data/matches'
import {
  fetchMatchSeasons,
  fetchSeason,
  mapStandingsFromSeason,
  seasonShortLabel,
} from '@/landing/features/matches/data/seasons'
import type { StandingsContent } from '@/landing/features/matches/types'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { buildListUrl, parsePageParam } from '@/landing/lib/listUrl'
import { EmptyState } from '@/landing/ui/EmptyState'
import { SectionShell } from '@/landing/ui/SectionShell'
import { buildPageMetadata } from '@/lib/buildPageMetadata'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

type Args = { searchParams: Promise<{ sezona?: string; strana?: string }> }

const PER_PAGE = 6

/**
 * Cesta výpisu bez `#odehrane` — kotva patří jen do odkazů stránkování v UI,
 * ne do `canonical`. Sdílí ji komponenta (`hrefFor`) i `generateMetadata`.
 */
const listPath = (page: number, seasonSlug: string | null, hash?: string): string =>
  buildListUrl(routes.list.matches, {
    filters: { sezona: seasonSlug },
    page,
    pageKey: 'strana',
    hash,
  })

/**
 * Zápasy a tabulka — handoff „HC Cestice Zapasy".
 *
 * Filtr sezóny i stránkování výsledků žijí v URL
 * (`?sezona=2025-2026&strana=2`), stránka je proto plně dynamická.
 * Neznámá `?sezona=` spadne na aktuální sezónu; změna sezóny resetuje
 * stránkování na první stranu (odkaz filtru `strana` nenese).
 */
export default async function ZapasyPage({ searchParams }: Args) {
  const { sezona, strana } = await searchParams
  const requestedPage = parsePageParam(strana)

  const [matchSeasons, currentSeason] = await Promise.all([fetchMatchSeasons(), fetchSeason()])

  // `fetchMatchSeasons` vrací jen sezóny s aspoň jedním zápasem (pilulky
  // filtru), takže čerstvě založená aktuální sezóna bez zápasů by v ní
  // chyběla a stránka by potichu spadla na starší sezónu se zápasy.
  const seasons =
    currentSeason && !matchSeasons.some((season) => season.id === currentSeason.id)
      ? [currentSeason, ...matchSeasons]
      : matchSeasons

  const activeSeason =
    (sezona ? seasons.find((season) => season.slug === sezona) : null) ??
    seasons.find((season) => season.isCurrent) ??
    seasons[0] ??
    null

  const [fixtures, results, form] = activeSeason
    ? await Promise.all([
        fetchSeasonFixtures(activeSeason.id),
        fetchSeasonResults({ seasonId: activeSeason.id, page: requestedPage, perPage: PER_PAGE }),
        fetchSeasonForm(activeSeason.id),
      ])
    : [[], { rows: [], page: 1, totalPages: 1, totalDocs: 0 }, null]

  // Strana za poslední stranou výpisu je 404, ne prázdný výpis se statusem 200:
  // strana nad `totalPages` neexistuje (prázdný výpis má `totalPages` 0 nebo
  // 1 — první strana je vždy platná).
  // `notFound()`, ne redirect. Pozor: nad výpisem je `loading.tsx`, takže
  // status zůstane 200 (streaming už začal) a 404 je jen obsah a `noindex`;
  // HTTP 404 by vyžadovalo vyndat `loading.tsx` (viz AGENTS.md).
  if (requestedPage > Math.max(1, results.totalPages)) notFound()

  // Prázdné řádky si řeší `StandingsPanel` sám (vlastní `EmptyState`) —
  // tabulka se proto skládá vždy, i pro sezónu bez vyplněné tabulky.
  const standings: StandingsContent = mapStandingsFromSeason(activeSeason)

  // Sezóny jsou řazené od nejnovější (`fetchMatchSeasons`), takže `seasons[0]`
  // je ta aktuální/nadcházející. U starších (dohraných) sezón nemá smysl
  // hlásit "Žádný zápas na programu" — ten text patří jen k té, kde ještě
  // rozlosování může přibýt.
  const isLatestSeason = !activeSeason || seasons[0]?.id === activeSeason.id

  // Obě prázdné karty (bez odehraných zápasů i bez tabulky) mají mít stejnou
  // výšku — `items-stretch` je proto podmíněné, ne default. S reálnými daty
  // by roztažení na stejnou výšku vynutilo zbytečnou prázdnou plochu pod
  // kratším sloupcem (výsledky a tabulka mají typicky jinou přirozenou délku).
  const bothEmpty = results.rows.length === 0 && standings.rows.length === 0

  const hrefFor = (n: number): string => listPath(n, activeSeason?.slug ?? null, 'odehrane')

  return (
    <SubpageShell pattern={{ variant: 'grid', tone: 'club', fade: 'top-right' }}>
      <MatchesJsonLd fixtures={fixtures} results={results.rows} />

      <MatchesHeader
        activeSlug={activeSeason?.slug ?? null}
        fullTableUrl={standings.fullTableUrl}
        seasons={seasons.flatMap((season) =>
          season.slug ? [{ slug: season.slug, label: seasonShortLabel(season) }] : [],
        )}
      />

      {/* Prázdný stav dostane jen aktuální sezóna na /zapasy — u starší
          (dohrané) sezóny se sekce rovnou skryje, stejně jako výřez na home
          page (viz `FixturesRail`). Bez `isLatestSeason` by "Žádný zápas na
          programu" viselo i pod loňskou sezónou, kde už žádné rozlosování
          nepřibude. */}
      <FixturesRail
        emptyState={
          isLatestSeason ? (
            <EmptyState
              actions={
                <>
                  <Button asChild size="md" variant="dark" withArrow>
                    <Link href="/aktuality">Sledovat aktuality</Link>
                  </Button>
                  <Button asChild size="md" variant="outline">
                    <Link href="/zapasy#odehrane">Odehrané zápasy</Link>
                  </Button>
                </>
              }
              icon="schedule"
              title="Žádný zápas na programu"
              titleAs="h3"
              watermark="VČHL"
            >
              Rozlosování nové sezóny zveřejní VČHL během léta. Sledujte aktuality — dáme vědět,
              jakmile bude termínovka venku.
            </EmptyState>
          ) : undefined
        }
        fixtures={fixtures}
        id="rozlosovani"
        layout="list"
      />

      {form && <FormStrip form={form} />}

      {/* Dva sloupce naskakují až od `lg`: na tabletu (768px) zbylo na
          výsledky ~430 px a na tabulku ~330 px, takže se řádky zápasů
          lámaly do tří řádků a názvy týmů se krátily na „HC Baroni Op…".
          Handoff to zalamuje na 760px, ale kreslí jen 1440px plochu. */}
      <SectionShell
        className={cn(
          'grid grid-cols-1 gap-split-gap lg:grid-cols-[1.15fr_0.85fr]',
          bothEmpty ? 'items-stretch' : 'items-start',
        )}
        spacing="section"
      >
        <ResultsList
          hrefFor={hrefFor}
          page={results.page}
          rows={results.rows}
          totalPages={results.totalPages}
        />
        <StandingsPanel standings={standings} />
      </SectionShell>

      <MatchesCta />
    </SubpageShell>
  )
}

const TITLE = 'Zápasy a tabulka'
const DESCRIPTION =
  'Rozlosování, výsledky a průběžná tabulka Východočeské hokejové ligy. Domácí zápasy hrajeme na zimním stadionu v Rychnově nad Kněžnou.'

/**
 * Metadata musí být `generateMetadata`, ne statický export — stejný důvod
 * jako u `/aktuality`: statický objekt nevidí `searchParams`, takže každá
 * stránka výsledků (`?strana=2`, `?strana=3`, …) inzerovala stejný
 * `canonical: '/zapasy'` a Google to čte jako duplicity.
 *
 * Filtr sezóny (`?sezona=`) se do rozhodnutí o indexaci nepočítá — stejně
 * jako `?typ=` u `/aktuality` se na první straně vždy konsoliduje do holého
 * `/zapasy`. Jen `strana > 1` dostane `noindex, follow`: výpis výsledků sám
 * o sobě nemá vlastní hodnotu, ale crawler po něm musí projít na detaily
 * zápasů a tabulku.
 */
export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { sezona, strana } = await searchParams
  const page = parsePageParam(strana)

  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: page > 1 ? listPath(page, sezona ?? null) : routes.list.matches,
    robots: page > 1 ? { follow: true, index: false } : undefined,
  })
}
