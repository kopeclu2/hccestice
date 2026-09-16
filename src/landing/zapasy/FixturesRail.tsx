import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { NextMatchPanel } from '../components/NextMatchPanel'
import { Numeral } from '../components/Numeral'
import { PillLink } from '../components/PillLink'
import { SectionShell, type SectionShellProps } from '../components/SectionShell'
import type { FixtureCard } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

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
}) {
  if (fixtures.length === 0) {
    if (!emptyState) return null

    return (
      <SectionShell className={className} id={id} spacing={spacing}>
        <SectionHead note="Rozlosování" title="Nadcházející zápasy" variant={headVariant} />
        <div className="mt-5">{emptyState}</div>
      </SectionShell>
    )
  }

  const solo = fixtures.length === 1 ? fixtures[0]! : null
  const stacked = fixtures.length > 2
  const nearest = stacked ? fixtures[0]! : null
  const rest = stacked ? fixtures.slice(1) : fixtures

  return (
    <SectionShell className={className} id={id} spacing={spacing}>
      <SectionHead note="Rozlosování" title="Nadcházející zápasy" variant={headVariant}>
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      {solo ? (
        <div className="mt-5">
          <SoloFixturePanel fixture={solo} />
        </div>
      ) : stacked ? (
        <div className="mt-5 space-y-3.5 md:space-y-4">
          <SoloFixturePanel fixture={nearest!} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((fixture) => (
              <FixtureTile fixture={fixture} key={fixture.id} />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="no-scrollbar mt-5 -mx-[clamp(0.875rem,3vw,2.5rem)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(0.875rem,3vw,2.5rem)] pt-0.5 pb-2.5 max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)] md:mx-0 md:gap-3.5 md:px-0.5"
          id={RAIL_ID}
        >
          {rest.map((fixture) => (
            <FixtureTile className="w-[78%] flex-none snap-start md:w-77.5" fixture={fixture} key={fixture.id} />
          ))}
        </div>
      )}
    </SectionShell>
  )
}

/** Jedna karta zápasu — v pásu (2 zápasy) i v mřížce pod nejbližším (3+). */
function FixtureTile({ fixture, className }: { fixture: FixtureCard; className?: string }) {
  return (
    <article
      className={cn(
        'border-line-soft hover:border-club overflow-hidden rounded-tile border bg-surface px-5 py-5 transition-colors md:px-6 md:py-5.5 lg:px-6.5 lg:py-6',
        className,
      )}
    >
      {/* flex-wrap: na 320px se „Nejbližší" do řádku se štítky nevejde
          a bez zalomení ho `overflow-hidden` karty odřízne */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Badge variant={fixture.kind === 'Doma' ? 'lime' : 'chip'}>{fixture.kind}</Badge>
        <span className="text-caption font-bold opacity-65">{fixture.stage}</span>
        <div className="flex-1" />
        {fixture.isNext && (
          <Eyebrow className="flex items-center gap-1.75" tone="club">
            <span className="bg-lime size-1.75 rounded-full shadow-ring-lime" />
            Nejbližší
          </Eyebrow>
        )}
      </div>

      <CardTitle className="mt-3.5 text-pretty" size="sm">
        {fixture.title}
      </CardTitle>

      <div className="mt-3 flex items-baseline gap-2.5">
        <Numeral size="md">{fixture.dateLabel}</Numeral>
        <span className="text-meta font-bold opacity-70">{fixture.timeLabel}</span>
      </div>

      {fixture.venue && (
        <div className="mt-1 text-caption font-semibold opacity-65">{fixture.venue}</div>
      )}
    </article>
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
          <PillLink href="/kontakt" size="md" variant="lime" withArrow>
            Jak se dostat na zimák
          </PillLink>
          <PillLink href="/zapasy#odehrane" size="md" variant="inverse">
            Odehrané zápasy
          </PillLink>
        </div>
      }
      kickoffISO={fixture.startDate}
      kicker={`Nejbližší zápas · ${fixture.kind}`}
      layout="wide"
      meta={
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <Numeral className="text-white" size="2xl">
            {fixture.dateLabel}
          </Numeral>
          <span className="text-numeral-sm font-extrabold text-white/70">{fixture.timeLabel}</span>
        </div>
      }
      radius="section"
      subtitle={subtitle || undefined}
      title={fixture.title}
    />
  )
}
