import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { FixtureCard } from '@/landing/features/matches/types'
import { type FixturesLayout, pickLayout } from '@/landing/features/matches/view/fixturesLayout'
import { Badge } from '@/landing/ui/Badge'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { MoreLink } from '@/landing/ui/MoreLink'
import { Numeral } from '@/landing/ui/Numeral'
import { SectionShell, type SectionShellProps } from '@/landing/ui/SectionShell'
import { StretchedLink, stretchHost } from '@/landing/ui/StretchedLink'
import { cn } from '@/lib/utils'

import { MatchMeta } from './MatchMeta'
import { MATCH_LIST, MATCH_ROW, MatchRowTitle, MatchWhen } from './MatchRow'
import { NextMatchPanel } from './NextMatchPanel'
import { SectionHead, type SectionHeadVariant } from './SectionHead'
import { TeamPair } from './TeamPair'

const RAIL_ID = 'rozlosovani-pas'

/**
 * Nadcházející zápasy.
 *
 * Tři rozvržení podle počtu zápasů:
 *
 * - **1 zápas** — samotný tmavý `NextMatchPanel` přes celou šířku sekce.
 *   Karta z pásu (~400px) by v 1320px široké sekci nechala přes 900px
 *   prázdna. Tentýž panel vykresluje i widget „Nejbližší zápas", mezisezóně
 *   je tenhle stav běžný, takže nejde o okrajovou větev.
 * - **2 zápasy** — vodorovný pás dvou stejně velkých bílých karet
 *   (scroll-snap zůstává i pro dvojici, ale reálně se neuplatní — obě se
 *   vejdou vedle sebe).
 * - **3 a víc** — nejbližší zápas dostane tentýž `NextMatchPanel` co u
 *   jediného zápasu, zbytek se skládá pod něj do mřížky malých karet.
 *   Vodorovný pás se scrollováním by u delšího rozlosování schovával
 *   většinu zápasů mimo viditelnou plochu; mřížka je čte všechny najednou.
 *
 * Karty v pásu (2 zápasy) jsou na mobilu záměrně užší než pás (78 %), aby
 * z něj vykukoval kus druhé karty — bez šipek na mobilu (handoff je tam
 * skrývá) je to jediný náznak, že se dá scrollovat. Pravý okraj pásu se
 * proto pod `md` prolíná do prázdna (maska).
 *
 * `layout="list"` (stránka /zapasy) nahradí mřížku i pás tabulkovým výpisem:
 * nejbližší zápas zůstane v `NextMatchPanel`, ostatní jdou pod sebe jako
 * řádky jedné karty. Celé rozlosování se tak čte shora dolů jako termínovka,
 * místo přeskakování očima mezi dlaždicemi. Výřez na home page zůstává
 * u karet (`cards`).
 *
 * `moreHref` přidá do hlavičky proklik a `headVariant` přepne styl nadpisu
 * (výřez sekce na home page), `id` + `className` slouží ke zakotvení sekce
 * v layoutu volajícího. `spacing` řídí odstup — na home je to plný rytmus
 * sekce (`landing`), na /zapasy první blok po hlavičce (`content`).
 *
 * Bez zápasů se sekce **buď** vůbec nevykreslí (výchozí — tak se chová výřez
 * na home page u dohrané sezóny), **nebo** ukáže `emptyState`. Prázdný pás
 * bez vysvětlení není varianta: na /zapasy by po hlavičce „Rozlosování"
 * nenásledovalo nic a vypadalo by to jako chyba stránky.
 */
export function FixturesRail({
  fixtures,
  moreHref,
  moreLabel = 'Všechny zápasy',
  headVariant,
  className,
  emptyState,
  id,
  spacing = 'content',
  layout = 'cards',
}: {
  fixtures: FixtureCard[]
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
  className?: string
  /** Prázdný stav místo pásu. Bez něj se sekce bez zápasů skryje. */
  emptyState?: React.ReactNode
  id?: string
  spacing?: SectionShellProps['spacing']
  /** `list` = nejbližší zápas v panelu, zbytek jako řádky pod sebou (/zapasy). */
  layout?: 'cards' | 'list'
}) {
  const picked = pickLayout(fixtures, layout)

  if (picked.kind === 'empty') {
    if (!emptyState) return null

    return (
      <SectionShell className={className} id={id} spacing={spacing}>
        <SectionHead note="Rozlosování" title="Nadcházející zápasy" variant={headVariant} />
        <div className="mt-5">{emptyState}</div>
      </SectionShell>
    )
  }

  return (
    <SectionShell className={className} id={id} spacing={spacing}>
      <SectionHead note="Rozlosování" title="Nadcházející zápasy" variant={headVariant}>
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      <FixturesBody picked={picked} />
    </SectionShell>
  )
}

function FixturesBody({
  picked,
}: {
  picked: Exclude<FixturesLayout<FixtureCard>, { kind: 'empty' }>
}) {
  switch (picked.kind) {
    case 'solo':
      return (
        <div className="mt-5">
          <SoloFixturePanel fixture={picked.fixture} />
        </div>
      )
    case 'stacked':
      return (
        <div className="mt-5 space-y-3.5 md:space-y-4">
          <SoloFixturePanel fixture={picked.nearest} />
          {picked.display === 'list' ? (
            <FixtureList fixtures={picked.rest} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {picked.rest.map((fixture) => (
                <FixtureTile fixture={fixture} key={fixture.id} />
              ))}
            </div>
          )}
        </div>
      )
    case 'rail':
      return (
        <div
          className="-mx-gutter mt-5 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter pt-0.5 pb-2.5 max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)] md:mx-0 md:gap-3.5 md:px-0.5"
          id={RAIL_ID}
        >
          {picked.fixtures.map((fixture) => (
            <FixtureTile
              className="w-[78%] flex-none snap-start md:w-77.5"
              fixture={fixture}
              key={fixture.id}
            />
          ))}
        </div>
      )
  }
}

/** Jedna karta zápasu — v pásu (2 zápasy) i v mřížce pod nejbližším (3+). */
function FixtureTile({ fixture, className }: { fixture: FixtureCard; className?: string }) {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-tile border border-line-soft bg-surface px-5 py-5 transition-colors hover:border-club md:px-6 md:py-5.5 lg:px-6.5 lg:py-6',
        stretchHost,
        className,
      )}
    >
      {/* flex-wrap: na 320px se „Nejbližší" do řádku se štítky nevejde
          a bez zalomení ho `overflow-hidden` karty odřízne */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Badge variant={fixture.kind === 'Doma' ? 'lime' : 'chip'}>{fixture.kind}</Badge>
        <span className="text-xs font-semibold opacity-65">{fixture.stage}</span>
        <div className="flex-1" />
        {fixture.isNext && (
          <Eyebrow className="flex items-center gap-1.75" tone="club">
            <span className="size-1.75 rounded-full bg-lime shadow-ring-lime" />
            Nejbližší
          </Eyebrow>
        )}
      </div>

      <CardTitle className="mt-3.5 text-pretty" size="sm">
        <StretchedLink href={fixture.href}>
          <TeamPair away={fixture.awayName} home={fixture.homeName} />
        </StretchedLink>
      </CardTitle>

      <div className="mt-3 flex items-baseline gap-2.5">
        <Numeral size="md">{fixture.dateLabel}</Numeral>
        <span className="text-sm font-semibold opacity-70">{fixture.timeLabel}</span>
      </div>

      {fixture.venue && <div className="mt-1 text-xs font-medium opacity-65">{fixture.venue}</div>}
    </article>
  )
}

/**
 * Rozlosování jako tabulka — jedna karta, řádky oddělené linkou.
 *
 * Sloupce sdílí s `ResultsList` (`MATCH_ROW` v `MatchRow.tsx`): 96 px datum
 * a čas, název zápasu, vpravo štítek. Týmy jsou pod sebou
 * (`TeamPair layout="stack"`), na mobilu jde navíc datum a čas na vlastní
 * řádek nad název; stejně jako u výsledků.
 *
 * Od `lg` má rozlosování navíc vlastní sloupec s místem a fází. Výpis je přes
 * celou šířku sekce (~1320 px) a s údaji pod názvem zůstávalo mezi názvem
 * a štítkem „Doma" přes 800 px prázdna; výsledky sedí v užším sloupci
 * vedle tabulky, takže tam údaje zůstávají pod názvem.
 */
function FixtureList({ fixtures }: { fixtures: FixtureCard[] }) {
  return (
    <ol className={MATCH_LIST}>
      {fixtures.map((fixture) => (
        <li
          className={cn(
            MATCH_ROW,
            'lg:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)_4.5rem]',
            stretchHost,
            'has-[[data-stretched]:focus-visible]:-outline-offset-2',
          )}
          key={fixture.id}
        >
          <MatchWhen
            date={fixture.dateLabel}
            dateTime={fixture.startDate}
            time={fixture.timeLabel}
            weekday={fixture.weekdayLabel}
          />

          <div className="min-w-0">
            <MatchRowTitle
              away={fixture.awayName}
              awayLogo={fixture.awayLogo}
              home={fixture.homeName}
              homeLogo={fixture.homeLogo}
              href={fixture.href}
            />
            <MatchMeta className="mt-1 lg:hidden" items={[fixture.stage, fixture.venue]} />
          </div>

          <div className="hidden min-w-0 lg:block">
            <div className="text-sm font-medium text-pretty text-ink-soft">
              {fixture.venue ?? '—'}
            </div>
            <div className="mt-0.5 text-xs font-medium text-faint">{fixture.stage}</div>
          </div>

          <Badge className="justify-self-end" variant={fixture.kind === 'Doma' ? 'lime' : 'chip'}>
            {fixture.kind}
          </Badge>
        </li>
      ))}
    </ol>
  )
}

/**
 * Jediný nadcházející zápas — hero panel přes celou šířku sekce.
 *
 * Kolo a místo jdou do ztišeného podtitulku, datum a čas do levého sloupce
 * (`Numeral 2xl`, tedy dvojnásobek proti kartě v pásu). CTA míří na
 * `/kontakt`, kde je adresa zimáku — vlastní stránka „jak se dostat"
 * neexistuje a vyrábět kvůli jednomu tlačítku novou by znamenalo obsah,
 * který nikdo nespravuje.
 */
function SoloFixturePanel({ fixture }: { fixture: FixtureCard }) {
  const subtitle = [fixture.stage, fixture.venue].filter(Boolean).join(' · ')

  return (
    <NextMatchPanel
      actions={
        <div className="mt-6 flex flex-wrap gap-2.5 lg:justify-end">
          <Button asChild size="md" variant="lime" withArrow>
            <Link href="/kontakt">Jak se dostat na zimák</Link>
          </Button>
          <Button asChild size="md" variant="inverse">
            <Link href="/zapasy#odehrane">Odehrané zápasy</Link>
          </Button>
        </div>
      }
      kickoffISO={fixture.startDate}
      kicker={`Nejbližší zápas · ${fixture.kind}`}
      layout="wide"
      meta={
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <Numeral className="text-on-contrast" size="2xl">
            {fixture.dateLabel}
          </Numeral>
          <span className="text-2xl font-extrabold text-on-contrast-muted">
            {fixture.timeLabel}
          </span>
        </div>
      }
      radius="section"
      subtitle={subtitle || undefined}
      href={fixture.href}
      title={fixture.title}
    />
  )
}
