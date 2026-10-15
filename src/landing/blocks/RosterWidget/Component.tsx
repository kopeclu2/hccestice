import React from 'react'

import { fetchRoster, POSITION_LABEL } from '@/landing/data/players'
import type { RosterPlayer } from '@/landing/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { PhotoTile, TileBadge } from '@/landing/ui/PhotoTile'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { RosterWidgetBlock } from '@/payload-types'

/** Widget soupisky — zobrazí všechny aktivní hráče. */
export async function RosterWidgetBlockComponent({ block }: { block: RosterWidgetBlock }) {
  const players = await fetchRoster()
  return <RosterWidgetView players={players} title={block.title ?? null} />
}

/** Soupiska — mřížka hráčů s portrétem, číslem a postem. */
export function RosterWidgetView({
  title,
  players,
}: {
  title: string | null
  players: RosterPlayer[]
}) {
  if (players.length === 0) return null
  return (
    <SectionShell>
      <Reveal>
        {title && (
          <CardTitle as="h3" className="mb-6" size="md">
            <Highlight>{title}</Highlight>
          </CardTitle>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {players.map((player) => (
            <div className="text-center" key={player.id}>
              <PhotoTile
                className="aspect-[3/4] rounded-thumb"
                photo={player.photo}
                sizes="(max-width: 40rem) 50vw, (max-width: 48rem) 33vw, (max-width: 64rem) 25vw, 20vw"
              >
                {player.number != null && (
                  <TileBadge className="top-2.5 left-2.5" tone="lime">
                    #{player.number}
                  </TileBadge>
                )}
              </PhotoTile>
              <div className="mt-2 text-sm font-bold md:text-base">{player.name}</div>
              {player.position && (
                <div className="text-xs font-medium text-faint">
                  {POSITION_LABEL[player.position] ?? player.position}
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
