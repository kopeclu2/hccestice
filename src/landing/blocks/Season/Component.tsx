import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { FixturesRail } from '@/landing/features/matches/components/FixturesRail'
import { ResultsList } from '@/landing/features/matches/components/ResultsList'
import { StandingsPanel } from '@/landing/features/matches/components/StandingsPanel'
import { fetchSeasonFixtures, fetchSeasonResults } from '@/landing/features/matches/data/matches'
import { fetchSeason, mapStandingsFromSeason } from '@/landing/features/matches/data/seasons'
import type { FixtureCard, ResultRow, StandingsContent } from '@/landing/features/matches/types'
import { relId } from '@/landing/lib/payload'
import { EmptyState } from '@/landing/ui/EmptyState'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { cn } from '@/lib/utils'
import type { LandingSeasonBlock } from '@/payload-types'

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
  const [fixtures, results] = await Promise.all([
    season ? fetchSeasonFixtures(season.id) : Promise.resolve<FixtureCard[]>([]),
    season
      ? fetchSeasonResults({ seasonId: season.id, page: 1, perPage: HOME_RESULTS }).then(
          (page) => page.rows,
        )
      : Promise.resolve<ResultRow[]>([]),
  ])
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
 *
 * Bez vlastního štítku a nadpisu nad výřezy: pás zápasů má v hlavičce
 * štítek „Rozlosování" a nadpis „Nadcházející zápasy", takže další štítek
 * „Sezóna" nad ním byl jen duplicita (dva štítky pod sebou). Sekci na mobilu
 * ohlásí hlavička pásu stejně jako ostatním sekcím jejich Kicker.
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
  // Obě prázdné karty mají mít stejnou výšku — viz stejná úvaha v
  // `app/(landing)/zapasy/(vypis)/page.tsx`.
  const bothEmpty = results.length === 0 && standings.rows.length === 0

  return (
    <>
      {/* Sekce začíná přímo pásem zápasů: jeho hlavička (štítek „Rozlosování"
          + nadpis) ji ohlásí sama. Kotva `#sezona` (navigace, hero) je na
          obalu **mimo** `Reveal`: ten při náběhu posouvá obsah o pár pixelů,
          takže kotva uvnitř něj po animaci skončila o tolik výš a štítek
          zajel pod fixní lištu (`scroll-mt-20` pak nestačil). */}
      <div className="scroll-mt-20" id="sezona">
        <Reveal>
          <FixturesRail
            emptyState={
              <EmptyState
                actions={
                  <>
                    <Button asChild size="md" variant="dark" withArrow>
                      <Link href="/aktuality">Sledovat aktuality</Link>
                    </Button>
                    <Button asChild size="md" variant="outline">
                      <Link href={`${ZAPASY_HREF}#odehrane`}>Odehrané zápasy</Link>
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
            }
            fixtures={fixtures}
            headVariant="landing"
            moreHref={ZAPASY_HREF}
            spacing="landing"
          />
        </Reveal>
      </div>

      {/* Dva sloupce až od `lg`: na tabletu (768px) vyšla tabulka na 296px,
          takže se názvy týmů odřízly do „HC Baroni Op…", a řádek výsledku
          se lisoval do sloupečku (datum na tři řádky, skóre na vlastní).
          Pod `lg` jdou oba výřezy na celou šířku pod sebe. `FixturesRail` má
          vždy `emptyState`, takže se nad touhle sekcí vykreslí i bez zápasů
          — kotva `#sezona` proto zůstává jen na ní, ne tady. */}
      <SectionShell
        className={cn(
          'grid grid-cols-1 gap-x-split-gap gap-y-13 lg:grid-cols-[1.15fr_0.85fr]',
          bothEmpty ? 'items-stretch' : 'items-start',
        )}
        spacing="split"
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
