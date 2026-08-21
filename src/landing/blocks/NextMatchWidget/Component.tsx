import type { NextMatchWidgetBlock } from '@/payload-types'

import React from 'react'

import { CardTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { fetchUpcoming } from '../../data/matches'
import type { UpcomingMatch } from '../../types'
import { Countdown } from '../Hero/Countdown'

/** Widget nejbližšího zápasu — načte nadcházející zápas z kolekce. */
export async function NextMatchWidgetBlockComponent({ block }: { block: NextMatchWidgetBlock }) {
  const { upcoming } = await fetchUpcoming()
  return <NextMatchWidgetView note={block.note ?? null} upcoming={upcoming} />
}

/** Nejbližší zápas — tmavá karta s live countdownem (mimo hero). */
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
        {/* p-6 na mobilu: 32px odsazení sebralo z 320px šířky pětinu a
            countdown se do zbytku nevešel. */}
        <div className="bg-contrast relative overflow-hidden rounded-card p-6 text-on-contrast md:p-12">
          <div className="hatch absolute inset-0 opacity-40" />
          {upcoming ? (
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span className="bg-lime shadow-ring-lime size-2 rounded-full" />
                <Eyebrow tone="lime">Nejbližší zápas · {upcoming.label}</Eyebrow>
              </div>
              <CardTitle as="h3" className="mt-2 leading-tight text-white" size="lg">
                {upcoming.title}
              </CardTitle>
              <div className="text-meta text-white/65">{upcoming.subtitle}</div>
              <Countdown targetISO={upcoming.kickoffISO} />
            </div>
          ) : (
            <p className="relative text-white/85">
              {note ?? 'Žádný zápas není naplánovaný — rozpis nové sezóny připravujeme.'}
            </p>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
