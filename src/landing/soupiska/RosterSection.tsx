import React from 'react'

import { SectionTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { Reveal } from '../components/Reveal'

import { PlayerTile, type SoupiskaCard } from './PlayerTile'

/**
 * Sekce soupisky: nadpis s počtem nad linkou (2px ink), anglický kicker
 * vpravo a mřížka karet. `id` je kotva pro pilulky v hlavičce stránky.
 *
 * Mřížka má tři body zlomu, ne dva: desktopové `minmax(258px)` vyšlo na
 * tabletu (768px) jen na **dva** sloupce, takže karty tam byly o třetinu
 * větší než na laptopu se třemi sloupci — z portrétů se staly plakáty.
 * Mezi 768 a 1024px se proto minimum snižuje na 208px (tři sloupce).
 */
export function RosterSection({
  anchor,
  title,
  kicker,
  count,
  cards,
}: {
  anchor: string
  title: string
  kicker: string
  count: string
  cards: SoupiskaCard[]
}) {
  if (cards.length === 0) return null
  return (
    <section className="scroll-mt-8" id={anchor}>
      <Reveal>
        <div className="border-contrast flex flex-wrap items-baseline gap-x-3.5 gap-y-1 border-b-2 pb-4">
          <SectionTitle size="md">{title}</SectionTitle>
          <span className="text-club text-meta font-bold">{count}</span>
          <div className="flex-1" />
          <Eyebrow className="text-faint/80 hidden md:block" wide>
            {kicker}
          </Eyebrow>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8.5 md:[grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))] md:gap-x-5.5 md:gap-y-10 lg:[grid-template-columns:repeat(auto-fill,minmax(16.125rem,1fr))]">
          {cards.map((card) => (
            <PlayerTile card={card} key={card.key} />
          ))}
        </div>
      </Reveal>
    </section>
  )
}
