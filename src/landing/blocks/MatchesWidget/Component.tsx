import type { MatchesWidgetBlock } from '@/payload-types'

import React from 'react'

import { Badge } from '../../components/Badge'
import { EmptyState } from '../../components/EmptyState'
import { CardTitle } from '../../components/Heading'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchMatchRows } from '../../data/matches'
import type { MatchRow } from '../../types'

/** Widget zápasů — načte řádky z kolekce dle filtrů bloku. */
export async function MatchesWidgetBlockComponent({ block }: { block: MatchesWidgetBlock }) {
  const rows = await fetchMatchRows({
    mode: block.mode,
    seasonId: relId(block.season),
    teamId: relId(block.team),
    limit: block.limit ?? 5,
  })
  return <MatchesWidgetView mode={block.mode} rows={rows} title={block.title ?? null} />
}

/** Zápasy — výsledky (se skóre) nebo rozpis, v bílé kartě. */
export function MatchesWidgetView({
  title,
  mode,
  rows,
}: {
  title: string | null
  mode: 'results' | 'schedule'
  rows: MatchRow[]
}) {
  return (
    <SectionShell>
      <Reveal>
        <div className="rounded-card bg-surface p-4.5 md:p-7 lg:p-9">
          <CardTitle className="mb-3.5" size="md">
            {title ?? (mode === 'results' ? 'Výsledky' : 'Rozpis zápasů')}
          </CardTitle>
          {rows.length === 0 ? (
            /* `bare`: widget už svou bílou kartu má, druhý rámeček navíc by
               vypadal jako karta v kartě. */
            <EmptyState
              actions={
                <PillLink href="/zapasy" size="sm" variant="dark" withArrow>
                  Všechny zápasy
                </PillLink>
              }
              frame="bare"
              icon="schedule"
              title={
                mode === 'results' ? 'Zatím žádný odehraný zápas' : 'Žádný zápas na programu'
              }
              titleAs="h3"
            >
              {mode === 'results'
                ? 'Jakmile odehrajeme první zápas, najdete tady výsledek.'
                : 'Rozpis doplníme, jakmile bude termínovka VČHL venku.'}
            </EmptyState>
          ) : (
            rows.map((row) => (
              <div
                /* Na mobilu dvousloupcová: datum s časem na vlastním řádku
                   nad názvem zápasu. S desktopovým sloupcem 88px zbylo na
                   320px na název ~88px a lisoval se do „HC / Čestice / × HC". */
                className="border-line-soft grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b py-3.25 last:border-b-0 md:grid-cols-[5.5rem_1fr_auto] md:gap-4"
                key={row.id}
              >
                <div className="col-span-2 flex items-baseline gap-2 md:col-span-1 md:block">
                  <div className="text-body font-extrabold">{row.dateLabel}</div>
                  <div className="text-faint text-eyebrow">{row.timeLabel}</div>
                </div>
                <div className="text-body font-bold">{row.title}</div>
                {row.score ? (
                  <Badge className="tabular-nums" variant="lime">
                    {row.score}
                    {row.suffix && ` ${row.suffix}`}
                  </Badge>
                ) : (
                  <Badge
                    className="tracking-[0.06em] uppercase"
                    size="xs"
                    variant={row.home ? 'club' : 'chip'}
                  >
                    {row.home ? 'Doma' : 'Venku'}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
