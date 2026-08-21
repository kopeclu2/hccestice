import Link from 'next/link'
import React from 'react'

import { CardTitle, SectionTitle } from '../components/Heading'
import { Highlight, Kicker } from '../components/Kicker'
import { PhotoTile, TileBadge } from '../components/PhotoTile'
import { PillLink } from '../components/PillLink'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import type { PostCard } from '../types'

/**
 * Sekce „Mohlo by tě zajímat" — tři fotokarty souvisejících článků
 * (ruční výběr v adminu doplněný nejnovějšími, viz `fetchRelatedPostCards`).
 */
export function ArticleRelated({ cards }: { cards: PostCard[] }) {
  if (cards.length === 0) return null

  return (
    <SectionShell spacing="section">
      <Reveal>
        <div className="mb-9 flex flex-wrap items-end gap-4">
          <div>
            <Kicker>Další čtení</Kicker>
            <SectionTitle className="mt-3.5" size="md">
              Mohlo by tě <Highlight>zajímat</Highlight>
            </SectionTitle>
          </div>
          <div className="hidden flex-1 md:block" />
          <PillLink href="/aktuality" size="sm" variant="outline">
            Všechny aktuality ↗
          </PillLink>
        </div>
      </Reveal>

      {/* Tři sloupce od `md` daly dlaždici na tabletu ~215px šířky — titulek
          pak přerostl celou fotku a přebil štítek. Zlomy teď kopírují
          `CardGrid`: 1 / 2 / 3 sloupce. Třetí dlaždice se ve dvou sloupcích
          rozpíná přes celý řádek, aby po ní nezůstala prázdná půlka. */}
      <div className="grid gap-5 md:grid-cols-2 md:max-lg:[&>*:nth-child(3)]:col-span-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const tile = (
            <PhotoTile
              className="min-h-80 rounded-block"
              photo={card.photo}
              sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 33vw"
            >
              <TileBadge className="top-4 left-4" tone="lime">
                {card.tag}
              </TileBadge>
              <div className="absolute inset-x-5 bottom-5 text-white">
                {/* Titulky importovaných článků mají i 70 znaků — bez clampu
                    vyplní dlaždici odshora dolů. */}
                <CardTitle as="h4" className="line-clamp-3" size="sm">
                  {card.title}
                </CardTitle>
                <div className="mt-2 text-caption font-semibold text-white/65">
                  {card.dateLabel}
                </div>
              </div>
            </PhotoTile>
          )
          return (
            <Reveal delay={index * 0.08} key={card.id}>
              {card.href ? (
                <Link className="block h-full" href={card.href}>
                  {tile}
                </Link>
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
