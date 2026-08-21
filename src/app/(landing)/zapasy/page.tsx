import type { Metadata } from 'next'

import React from 'react'

import { cn } from '@/utilities/ui'

import { EmptyState } from '@/landing/components/EmptyState'
import { PillLink } from '@/landing/components/PillLink'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { STANDINGS } from '@/landing/content'
import { fetchSeasonFixtures, fetchSeasonForm, fetchSeasonResults } from '@/landing/data/matches'
import { fetchMatchSeasons, seasonShortLabel } from '@/landing/data/seasons'
import type { StandingsContent } from '@/landing/types'
import { FixturesRail } from '@/landing/zapasy/FixturesRail'
import { FormStrip } from '@/landing/zapasy/FormStrip'
import { MatchesCta } from '@/landing/zapasy/MatchesCta'
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

  const seasons = await fetchMatchSeasons()

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

  const standingsRows = activeSeason?.standings?.rows ?? []
  const standings: StandingsContent | null =
    standingsRows.length > 0
      ? {
          seasonLabel:
            activeSeason?.standings?.label ??
            (activeSeason ? seasonShortLabel(activeSeason) : STANDINGS.seasonLabel),
          fullTableUrl: activeSeason?.standings?.fullTableUrl ?? STANDINGS.fullTableUrl,
          rows: standingsRows.map((row) => ({
            pos: row.pos,
            team: row.team,
            games: row.games ?? 0,
            points: row.points ?? 0,
          })),
        }
      : null

  const hrefFor = (n: number): string => {
    const params = new URLSearchParams()
    if (activeSeason?.slug) params.set('sezona', activeSeason.slug)
    if (n > 1) params.set('strana', String(n))
    const query = params.toString()
    return `/zapasy${query ? `?${query}` : ''}#odehrane`
  }

  return (
    <SubpageShell>
      <ZapasyHeader
        activeSlug={activeSeason?.slug ?? null}
        fullTableUrl={standings?.fullTableUrl ?? STANDINGS.fullTableUrl}
        seasons={seasons
          .filter((season) => season.slug)
          .map((season) => ({ slug: season.slug!, label: seasonShortLabel(season) }))}
      />

      {/* Prázdný stav dostane jen /zapasy — výřez na home page se u dohrané
          sezóny dál skrývá (viz `FixturesRail`). */}
      <FixturesRail
        emptyState={
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
        }
        fixtures={fixtures}
        id="rozlosovani"
      />

      {form && <FormStrip form={form} />}

      {/* Bez vyplněné tabulky sezóny zabere výpis výsledků celou šířku.
          Dva sloupce naskakují až od `lg`: na tabletu (768px) zbylo na
          výsledky ~430 px a na tabulku ~330 px, takže se řádky zápasů
          lámaly do tří řádků a názvy týmů se krátily na „HC Baroni Op…".
          Handoff to zalamuje na 760px, ale kreslí jen 1440px plochu. */}
      <SectionShell
        className={cn(
          'grid grid-cols-1 items-start gap-[clamp(1.25rem,3vw,2.5rem)]',
          standings && 'lg:grid-cols-[1.15fr_0.85fr]',
        )}
        spacing="content"
      >
        <ResultsList
          hrefFor={hrefFor}
          page={results.page}
          rows={results.rows}
          totalPages={results.totalPages}
        />
        {standings && <StandingsPanel standings={standings} />}
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
