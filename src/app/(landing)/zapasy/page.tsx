import type { Metadata } from 'next'

import React from 'react'

import { cn } from '@/utilities/ui'

import { EmptyState } from '@/landing/components/EmptyState'
import { PillLink } from '@/landing/components/PillLink'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { STANDINGS } from '@/landing/content'
import { fetchSeasonFixtures, fetchSeasonForm, fetchSeasonResults } from '@/landing/data/matches'
import { fetchMatchSeasons, fetchSeason, seasonShortLabel } from '@/landing/data/seasons'
import type { StandingsContent } from '@/landing/types'
import { FixturesRail } from '@/landing/zapasy/FixturesRail'
import { FormStrip } from '@/landing/zapasy/FormStrip'
import { MatchesCta } from '@/landing/zapasy/MatchesCta'
import { MatchesJsonLd } from '@/landing/zapasy/MatchesJsonLd'
import { ResultsList } from '@/landing/zapasy/ResultsList'
import { StandingsPanel } from '@/landing/zapasy/StandingsPanel'
import { ZapasyHeader } from '@/landing/zapasy/ZapasyHeader'

type Args = { searchParams: Promise<{ sezona?: string; strana?: string }> }

const PER_PAGE = 6

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
  const requestedPage = Math.max(1, Number.parseInt(strana ?? '1', 10) || 1)

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

  // Prázdné řádky si řeší `StandingsPanel` sám (vlastní `EmptyState`) —
  // tabulka se proto skládá vždy, i pro sezónu bez vyplněné tabulky.
  const standings: StandingsContent = {
    seasonLabel:
      activeSeason?.standings?.label ??
      (activeSeason ? seasonShortLabel(activeSeason) : STANDINGS.seasonLabel),
    fullTableUrl: activeSeason?.standings?.fullTableUrl ?? STANDINGS.fullTableUrl,
    rows: (activeSeason?.standings?.rows ?? []).map((row) => ({
      pos: row.pos,
      team: row.team,
      games: row.games ?? 0,
      points: row.points ?? 0,
    })),
  }

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

  const hrefFor = (n: number): string => {
    const params = new URLSearchParams()
    if (activeSeason?.slug) params.set('sezona', activeSeason.slug)
    if (n > 1) params.set('strana', String(n))
    const query = params.toString()
    return `/zapasy${query ? `?${query}` : ''}#odehrane`
  }

  return (
    <SubpageShell pattern={{ variant: 'grid', tone: 'club', fade: 'top-right' }}>
      <MatchesJsonLd fixtures={fixtures} results={results.rows} />

      <ZapasyHeader
        activeSlug={activeSeason?.slug ?? null}
        fullTableUrl={standings.fullTableUrl}
        seasons={seasons
          .filter((season) => season.slug)
          .map((season) => ({ slug: season.slug!, label: seasonShortLabel(season) }))}
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
                  <PillLink href="/aktuality" size="md" variant="dark" withArrow>
                    Sledovat aktuality
                  </PillLink>
                  <PillLink href="/zapasy#odehrane" size="md" variant="outline">
                    Odehrané zápasy
                  </PillLink>
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
      />

      {form && <FormStrip form={form} />}

      {/* Dva sloupce naskakují až od `lg`: na tabletu (768px) zbylo na
          výsledky ~430 px a na tabulku ~330 px, takže se řádky zápasů
          lámaly do tří řádků a názvy týmů se krátily na „HC Baroni Op…".
          Handoff to zalamuje na 760px, ale kreslí jen 1440px plochu. */}
      <SectionShell
        className={cn(
          'grid grid-cols-1 gap-[clamp(1.25rem,3vw,2.5rem)] lg:grid-cols-[1.15fr_0.85fr]',
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

export const metadata: Metadata = {
  title: 'Zápasy a tabulka | HC Čestice',
  description:
    'Rozlosování, výsledky a průběžná tabulka Východočeské hokejové ligy. Domácí zápasy hrajeme na zimním stadionu v Rychnově nad Kněžnou.',
  alternates: { canonical: '/zapasy' },
}
