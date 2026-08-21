import type { RosterWidgetBlock } from '@/payload-types'

import React from 'react'

import { CardTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { fetchRoster, POSITION_LABEL } from '../../data/players'
import type { RosterPlayer } from '../../types'

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
                sizes="(max-width: 48rem) 50vw, 20vw"
              >
                {player.number != null && (
                  <TileBadge className="top-2.5 left-2.5" tone="lime">
                    #{player.number}
                  </TileBadge>
                )}
              </PhotoTile>
              <div className="mt-2 text-body font-extrabold">{player.name}</div>
              {player.position && (
                <div className="text-faint text-caption font-semibold">
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
