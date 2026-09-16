import type { NextMatchWidgetBlock } from '@/payload-types'

import React from 'react'

import { NextMatchPanel } from '../../components/NextMatchPanel'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { fetchUpcoming } from '../../data/matches'
import type { UpcomingMatch } from '../../types'

/** Widget nejbližšího zápasu — načte nadcházející zápas z kolekce. */
export async function NextMatchWidgetBlockComponent({ block }: { block: NextMatchWidgetBlock }) {
  const { upcoming } = await fetchUpcoming()
  return <NextMatchWidgetView note={block.note ?? null} upcoming={upcoming} />
}

/**
 * Nejbližší zápas — tmavá karta s live countdownem (mimo hero).
 * Vzhled drží sdílený `NextMatchPanel` (stejný panel používá rozpis
 * zápasů, když je v termínovce jediný zápas).
 */
function NextMatchWidgetView({
  upcoming,
  note,
}: {
  upcoming: UpcomingMatch | null
  note: string | null
}) {
  return (
    <SectionShell>
      <Reveal>
        {upcoming ? (
          <NextMatchPanel
            kickoffISO={upcoming.kickoffISO}
            kicker={`Nejbližší zápas · ${upcoming.label}`}
            subtitle={upcoming.subtitle}
            title={upcoming.title}
          />
        ) : (
          <div className="bg-contrast relative overflow-hidden rounded-card p-6 text-on-contrast md:p-8 lg:p-12">
            <div className="hatch absolute inset-0 opacity-40" />
            <p className="relative text-white/85">
              {note ?? 'Žádný zápas není naplánovaný — rozpis nové sezóny připravujeme.'}
            </p>
          </div>
        )}
      </Reveal>
    </SectionShell>
  )
}
