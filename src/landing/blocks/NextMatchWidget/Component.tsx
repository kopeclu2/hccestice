import React from 'react'

import { NextMatchPanel } from '@/landing/features/matches/components/NextMatchPanel'
import { fetchUpcoming } from '@/landing/features/matches/data/matches'
import type { UpcomingMatch } from '@/landing/features/matches/types'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { NextMatchWidgetBlock } from '@/payload-types'

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
            href={upcoming.href}
            kickoffISO={upcoming.kickoffISO}
            kicker={`Nejbližší zápas · ${upcoming.label}`}
            subtitle={upcoming.subtitle}
            title={upcoming.title}
          />
        ) : (
          <div className="relative overflow-hidden rounded-card bg-contrast p-6 text-on-contrast md:p-8 lg:p-12">
            <div className="absolute inset-0 hatch opacity-40" />
            <p className="relative text-white/85">
              {note ?? 'Žádný zápas není naplánovaný — rozpis nové sezóny připravujeme.'}
            </p>
          </div>
        )}
      </Reveal>
    </SectionShell>
  )
}
