import type { PlayerCardBlock } from '@/payload-types'

import React from 'react'

import type { RosterPlayer } from '../../types'

import { CardTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchPickedPlayers, POSITION_LABEL } from '../../data/players'

/** Karta jednoho hráče — velký portrét, číslo, post, poznámka. */
export async function PlayerCardBlockComponent({ block }: { block: PlayerCardBlock }) {
  const playerId = relId(block.player)
  if (!playerId) return null
  const [player] = await fetchPickedPlayers([playerId])
  if (!player) return null
  return <PlayerCardView note={block.note ?? null} player={player} />
}

function PlayerCardView({ player, note }: { player: RosterPlayer; note: string | null }) {
  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto flex max-w-160 flex-col items-stretch gap-6 rounded-card bg-surface p-4.5 sm:flex-row md:p-8">
          <PhotoTile
            className="aspect-[3/4] w-full flex-none rounded-panel sm:w-60"
            photo={player.photo}
            sizes="(max-width: 40rem) 100vw, 15rem"
          >
            {player.number != null && (
              <TileBadge className="top-3 left-3" tone="lime">
                #{player.number}
              </TileBadge>
            )}
          </PhotoTile>
          <div className="flex flex-col justify-center">
            {player.position && (
              <Eyebrow tone="club">{POSITION_LABEL[player.position] ?? player.position}</Eyebrow>
            )}
            <CardTitle as="h3" className="mt-1" size="lg">
              {player.name}
              {player.number != null && (
                <span className="text-faint ml-3 font-normal">#{player.number}</span>
              )}
            </CardTitle>
            {note && <p className="text-dim mt-3 leading-relaxed text-pretty">{note}</p>}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
