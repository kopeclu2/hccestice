import type { PhotoCardsBlockType } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { PhotoTile, TileBadge } from '../../components/PhotoTile'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { uploadToPhoto } from '../../data/format'

const CARD_HEIGHTS: Record<string, string> = {
  sm: 'h-52.5',
  md: 'h-70',
  lg: 'h-90',
}

const CARD_COLUMNS: Record<string, string> = {
  '1': 'md:grid-cols-1',
  '2': 'md:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
}

/** Fotokarty — mřížka fotek se štítky a popiskem (jako karty O klubu). */
export function PhotoCardsBlockComponent({ block }: { block: PhotoCardsBlockType }) {
  const cards = block.cards ?? []
  if (cards.length === 0) return null

  return (
    <SectionShell>
      <div
        className={cn(
          'grid grid-cols-1 gap-5',
          CARD_COLUMNS[block.columns ?? '2'] ?? 'md:grid-cols-2',
        )}
      >
        {cards.map((card, index) => {
          const tile = (
            <PhotoTile
              className={cn('rounded-block', CARD_HEIGHTS[block.height ?? 'md'])}
              photo={uploadToPhoto(card.photo)}
              sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
            >
              {card.tag && <TileBadge className="top-3.5 left-3.5">{card.tag}</TileBadge>}
              {card.badge && (
                <TileBadge className="top-3.5 right-3.5" tone="lime">
                  {card.badge}
                </TileBadge>
              )}
              {card.caption && (
                <div className="absolute inset-x-4 bottom-4 text-body leading-normal font-semibold text-white">
                  {card.caption}
                </div>
              )}
            </PhotoTile>
          )
          return (
            <Reveal delay={index * 0.08} key={card.id ?? index}>
              {card.href ? (
                <a className="block" href={card.href}>
                  {tile}
                </a>
              ) : (
                tile
              )}
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
