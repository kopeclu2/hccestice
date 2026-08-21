import React from 'react'

import { cn } from '@/utilities/ui'

import { Badge } from '../components/Badge'
import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { MoreLink } from '../components/MoreLink'
import { Numeral } from '../components/Numeral'
import { RailArrows } from '../components/RailArrows'
import { SectionShell, type SectionShellProps } from '../components/SectionShell'
import type { FixtureCard } from '../types'

import { SectionHead, type SectionHeadVariant } from './SectionHead'

const RAIL_ID = 'rozlosovani-pas'

/**
 * Nadcházející zápasy — vodorovný pás bílých karet se scroll-snapem.
 * Při více než čtyřech zápasech přibudou v hlavičce šipky.
 *
 * Na mobilu je karta záměrně užší než pás (78 %), aby z něj vykukoval kus
 * další karty. Samo to ale nestačilo: `RailArrows` jsou podle handoffu na
 * mobilu skryté, takže o scrollování nic nevypovídalo. Pravý okraj pásu se
 * proto pod `md` prolíná do prázdna (maska) — vykukující karta tím vypadá
 * jako odstřižená a ne jako karta s divnou šířkou.
 *
 * U jediného zápasu není co scrollovat: karta se roztáhne na celou šířku
 * a maska se nekreslí, jinak by z 22 % pásu bylo jen mrtvé místo.
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

  const single = fixtures.length === 1

  return (
    <SectionShell className={className} id={id} spacing={spacing}>
      <SectionHead note="Rozlosování" title="Nadcházející zápasy" variant={headVariant}>
        {fixtures.length > 4 && <RailArrows targetId={RAIL_ID} />}
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      <div
        className={cn(
          'no-scrollbar mt-5 -mx-[clamp(0.875rem,3vw,2.5rem)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(0.875rem,3vw,2.5rem)] pt-0.5 pb-2.5 md:mx-0 md:gap-3.5 md:px-0.5',
          !single &&
            'max-md:[mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)]',
        )}
        id={RAIL_ID}
      >
        {fixtures.map((fixture) => (
          <article
            className={cn(
              'border-line-soft hover:border-club flex-none snap-start overflow-hidden rounded-tile border bg-surface px-6 py-5.5 transition-colors md:w-77.5',
              single ? 'w-full' : 'w-[78%]',
            )}
            key={fixture.id}
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
        ))}
      </div>
    </SectionShell>
  )
}
