import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { ResultRow } from '@/landing/features/matches/types'
import { Badge } from '@/landing/ui/Badge'
import { EmptyState } from '@/landing/ui/EmptyState'
import { MoreLink } from '@/landing/ui/MoreLink'
import { Numeral } from '@/landing/ui/Numeral'
import { Pagination } from '@/landing/ui/Pagination'
import { stretchHost } from '@/landing/ui/StretchedLink'
import { cn } from '@/lib/utils'

import { MatchMeta } from './MatchMeta'
import { MATCH_LIST, MATCH_ROW, MatchRowTitle, MatchWhen } from './MatchRow'
import { OUTCOME_BADGE } from './outcome'
import { SectionHead, type SectionHeadVariant } from './SectionHead'

/**
 * Odehrané zápasy — jedna karta s řádky oddělenými linkou, stejně jako
 * rozlosování (`FixturesRail` → `FixtureList`), stránkování po šesti.
 * Stav stránkování žije v URL (`?strana=`), odkazy dodá volající.
 *
 * Bez `hrefFor` se stránkování nevykreslí, hlavička dostane proklik
 * `moreHref` a přes `headVariant` i styl nadpisu landingu — takhle
 * sekci používá výřez na home page.
 */
export function ResultsList({
  rows,
  page = 1,
  totalPages = 1,
  hrefFor,
  moreHref,
  moreLabel = 'Všechny výsledky',
  headVariant,
}: {
  rows: ResultRow[]
  page?: number
  totalPages?: number
  hrefFor?: (page: number) => string
  moreHref?: string | null
  moreLabel?: string
  headVariant?: SectionHeadVariant
}) {
  return (
    <div className="flex h-full scroll-mt-8 flex-col" id="odehrane">
      <SectionHead note="Výsledky" title="Odehrané zápasy" variant={headVariant}>
        {moreHref && <MoreLink href={moreHref}>{moreLabel}</MoreLink>}
      </SectionHead>

      {rows.length === 0 ? (
        /* `flex-1 justify-center`: když je i sousední `StandingsPanel`
           prázdný, mřížka na /zapasy obě karty roztáhne na stejnou výšku
           (`items-stretch` jen pro tenhle případ, viz `page.tsx`) — obsah
           se pak vycentruje uprostřed vyšší karty místo přilepení nahoře. */
        <EmptyState
          actions={
            <>
              <Button asChild size="md" variant="dark" withArrow>
                <Link href="/aktuality">Sledovat aktuality</Link>
              </Button>
              <Button asChild size="md" variant="outline">
                <Link href="/zapasy#rozlosovani">Rozlosování</Link>
              </Button>
            </>
          }
          className="mt-5 flex-1 justify-center"
          icon="schedule"
          title="Zatím žádný odehraný zápas"
          titleAs="h3"
          watermark="VČHL"
        >
          Za tuhle sezónu jsme ještě nehráli. Jakmile padne první buly, najdete tady výsledek i s
          třetinami.
        </EmptyState>
      ) : (
        <ol className={cn(MATCH_LIST, 'mt-5')}>
          {rows.map((row) => {
            const badge = OUTCOME_BADGE[row.outcome]
            return (
              <li
                className={cn(
                  MATCH_ROW,
                  // Karta má `overflow-hidden`, takže obrys uvnitř, ne vně řádku.
                  stretchHost,
                  'has-[[data-stretched]:focus-visible]:-outline-offset-2',
                )}
                key={row.id}
              >
                <MatchWhen
                  date={row.dateLabel}
                  dateTime={row.startDate}
                  weekday={row.weekdayLabel}
                />

                <div className="min-w-0">
                  <MatchRowTitle
                    away={row.awayName}
                    awayLogo={row.awayLogo}
                    home={row.homeName}
                    homeLogo={row.homeLogo}
                    href={row.href}
                  />
                  {/* Fáze a místo jsou ztišený běžný text, stejně jako
                      v rozlosování — dřív byla fáze prostrkaný uppercase
                      ve sloupci data a „1.ROČNÍK - 2. SF" se v něm lámalo
                      do tří řádků. */}
                  <MatchMeta className="mt-1" items={[row.stage, row.venue]} />
                </div>

                {/* Mobil: skóre nad štítkem (sloupec je úzký a název má víc
                    místa), od `md` štítek a skóre vedle sebe. Skóre má
                    pevnou minimální šířku, aby štítky v řádcích lícovaly. */}
                <div className="flex flex-col-reverse items-end gap-1.5 md:flex-row md:items-center md:gap-4">
                  <Badge className="flex-none" variant={badge.variant}>
                    {badge.label}
                    {badge.note && <span className="sr-only"> {badge.note}</span>}
                  </Badge>
                  <Numeral className="min-w-14 flex-none text-right" size="xs">
                    {row.score}
                    {row.suffix && <span className="text-sm text-faint"> {row.suffix}</span>}
                  </Numeral>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {hrefFor && totalPages > 1 && (
        <Pagination hrefFor={hrefFor} page={page} totalPages={totalPages} variant="compact" />
      )}
    </div>
  )
}
