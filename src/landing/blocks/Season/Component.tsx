import type { LandingSeasonBlock } from '@/payload-types'

import React from 'react'

import { CardTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchLatestResults, fetchSeasonFixtures, fetchSeasonResults } from '../../data/matches'
import { fetchSeason, mapStandingsFromSeason } from '../../data/seasons'
import type { FixtureCard, ResultRow, StandingsContent } from '../../types'
import { FixturesRail } from '../../zapasy/FixturesRail'
import { ResultsList } from '../../zapasy/ResultsList'
import { StandingsPanel } from '../../zapasy/StandingsPanel'
import { cn } from '@/utilities/ui'

/** Výřezy sekcí na home page — plný výpis je na /zapasy. */
const ZAPASY_HREF = '/zapasy'
const HOME_FIXTURES = 3
const HOME_RESULTS = 4
const HOME_STANDINGS = 6

/**
 * Sezóna: rozpis a výsledky z kolekce zápasů, tabulka z dokumentu
 * sezóny. Vykreslují to stejné komponenty jako stránka /zapasy,
 * jen zkrácené na výřez a s prokliky na /zapasy.
 */
export async function SeasonBlockComponent({ block }: { block: LandingSeasonBlock }) {
  const season = await fetchSeason(relId(block.season))
  const [fixtures, seasonResults] = await Promise.all([
    season ? fetchSeasonFixtures(season.id) : Promise.resolve<FixtureCard[]>([]),
    season
      ? fetchSeasonResults({ seasonId: season.id, page: 1, perPage: HOME_RESULTS }).then(
          (page) => page.rows,
        )
      : Promise.resolve<ResultRow[]>([]),
  ])
  // na začátku sezóny ještě není co ukázat — vezmeme poslední zápasy vůbec
  const results = seasonResults.length > 0 ? seasonResults : await fetchLatestResults(HOME_RESULTS)
  return (
    <SeasonView
      fixtures={fixtures.slice(0, HOME_FIXTURES)}
      results={results}
      standings={mapStandingsFromSeason(season)}
    />
  )
}

/**
 * Sezóna — výřezy sekcí z /zapasy: pás nadcházejících zápasů a pod ním
 * dvojice Odehrané zápasy / Tabulka. Každý výřez má proklik na /zapasy.
 * Sekce nese kotvu `#sezona` (odkazuje na ni hlavní navigace i hero).
 */
function SeasonView({
  fixtures,
  results,
  standings,
}: {
  fixtures: FixtureCard[]
  results: ResultRow[]
  standings: StandingsContent
}) {
  // dohraná sezóna nemá rozpis — kotva a odstup sekce pak drží na výsledcích
  const hasFixtures = fixtures.length > 0

  return (
    <>
      <Reveal>
        <FixturesRail
          fixtures={fixtures}
          headVariant="landing"
          id="sezona"
          moreHref={ZAPASY_HREF}
          spacing="landing"
        />
      </Reveal>

      {/* Dva sloupce až od `lg`: na tabletu (768px) vyšla tabulka na 296px,
          takže se názvy týmů odřízly do „HC Baroni Op…", a řádek výsledku
          se lisoval do sloupečku (datum na tři řádky, skóre na vlastní).
          Pod `lg` jdou oba výřezy na celou šířku pod sebe. */}
      <SectionShell
        className="grid grid-cols-1 items-start gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-13 lg:grid-cols-[1.15fr_0.85fr]"
        id={hasFixtures ? undefined : 'sezona'}
        spacing={hasFixtures ? 'split' : 'landing'}
      >
        {/* Prázdný výpis si řeší `ResultsList` sám (`EmptyState`) — dřív tu
            stála vlastní `EmptySeasonNote`, tedy druhé znění téhož stavu. */}
        <Reveal>
          <ResultsList headVariant="landing" moreHref={ZAPASY_HREF} rows={results} />
        </Reveal>
        <Reveal delay={0.1}>
          <StandingsPanel
            headVariant="landing"
            limit={HOME_STANDINGS}
            moreHref={ZAPASY_HREF}
            standings={standings}
            title="Tabulka VČHL"
          />
        </Reveal>
      </SectionShell>
    </>
  )
}

/** Tabulka VČHL — řádek HC Čestice zvýrazněný zeleně (sdílí ji widget Tabulka). */
export function StandingsCard({ standings }: { standings: StandingsContent }) {
  return (
    <div className="h-full rounded-card bg-surface p-4.5 md:p-9">
      <div className="mb-3.5 flex items-baseline gap-3">
        <CardTitle as="h3" size="md">
          Tabulka <Highlight>VČHL</Highlight>
        </CardTitle>
        <span className="text-faint text-caption">{standings.seasonLabel}</span>
      </div>

      {standings.rows.map((row) => {
        const isOurs = row.team === 'HC Čestice'
        return (
          <div
            className={cn(
              /* Na mobilu užší pevné sloupce a menší mezera: s desktopovými
                 hodnotami (32+40+40 px a gap-3) zbylo na název týmu tak málo,
                 že se „HC Spartak Choceň B" lámalo na čtyři řádky. */
              'border-line-soft grid grid-cols-[1.5rem_1fr_1.75rem_2rem] items-center gap-2 border-b py-2.75 md:grid-cols-[2rem_1fr_2.5rem_2.5rem] md:gap-3',
              isOurs && 'bg-tint',
            )}
            key={row.pos}
          >
            <div className={cn('text-meta font-extrabold', isOurs ? 'text-club' : 'text-faint')}>
              {row.pos}.
            </div>
            <div className={cn('text-meta md:text-body', isOurs ? 'font-extrabold' : 'font-semibold')}>
              {row.team}
            </div>
            <div className="text-faint text-right text-meta">{row.games}</div>
            <div className="text-right text-body font-extrabold">{row.points}</div>
          </div>
        )
      })}

      <a
        className="text-club hover:text-club-dark mt-3.5 inline-block text-meta font-bold"
        href={standings.fullTableUrl}
        rel="noreferrer"
        target="_blank"
      >
        Celá tabulka na ahl.cz ↗
      </a>
    </div>
  )
}
