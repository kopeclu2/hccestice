import { Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from '../components/Badge'
import { CardCta, CardGrid, CardShell } from '../components/CardGrid'
import { EmptyState } from '../components/EmptyState'
import { CardTitle } from '../components/Heading'
import { PillLink } from '../components/PillLink'
import { countLabel } from '../data/format'
import type { GalleryCard } from '../types'

/**
 * Výpis galerií — pravidelná mřížka, na mobilu jeden sloupec.
 *
 * Handoff „HC Cestice Galerie" měl masonry (CSS columns, řazení po sloupcích).
 * Přešlo se na grid stejně jako u výpisu aktualit: karty mají titulní fotku
 * v jednotném poměru, takže čtení po řádcích odpovídá řazení podle data.
 */
export function GalleryGrid({
  cards,
  activeSeasonLabel,
}: {
  cards: GalleryCard[]
  /** Zapnutý filtr sezóny — rozhoduje o znění prázdného stavu. */
  activeSeasonLabel?: string | null
}) {
  return (
    <CardGrid
      empty={<GalleryEmpty activeSeasonLabel={activeSeasonLabel ?? null} />}
      items={cards}
    >
      {(card) => <GalleryCardTile card={card} key={card.id} />}
    </CardGrid>
  )
}

/**
 * Prázdný výpis galerií (handoff „Z této sezóny zatím nemáme fotky").
 * Odkaz „Poslat fotky" míří na `/#kontakt` stejně jako `PhotosCta` pod
 * výpisem — `mailto:` z handoffu by obešel kontaktní formulář a jeho
 * ochranu reCAPTCHOU.
 */
function GalleryEmpty({ activeSeasonLabel }: { activeSeasonLabel: string | null }) {
  return (
    <EmptyState
      actions={
        <>
          <PillLink href="/#kontakt" size="md" variant="dark" withArrow>
            Poslat fotky
          </PillLink>
          {activeSeasonLabel && (
            <PillLink href="/fotogalerie#seznam" size="md" variant="outline">
              Starší sezóny
            </PillLink>
          )}
        </>
      }
      icon="photos"
      title={
        activeSeasonLabel ? 'Z této sezóny zatím nemáme fotky' : 'Zatím tu žádné galerie nejsou'
      }
    >
      {activeSeasonLabel ? (
        <>
          Fotogalerie ze sezóny <strong className="font-bold">{activeSeasonLabel}</strong> se teprve
          plní. Máte fotky ze zápasů? Pošlete nám je, rádi je zveřejníme.
        </>
      ) : (
        <>
          Fotoalbum se teprve plní. Máte fotky ze zápasů nebo z akcí klubu? Pošlete nám je, rádi je
          zveřejníme.
        </>
      )}
    </EmptyState>
  )
}

/**
 * Karta galerie: titulní fotka v poměru 4:3 (jednotná výška řádku),
 * lime pill sezóny vlevo nahoře, glass badge s počtem fotek vpravo dole.
 */
function GalleryCardTile({ card }: { card: GalleryCard }) {
  return (
    <CardShell href={card.href} pad="media">
      <div className="bg-pine relative aspect-[4/3] overflow-hidden rounded-badge">
        {card.cover && (
          <Image
            alt={card.cover.alt}
            className="object-cover"
            fill
            sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 33vw"
            src={getMediaUrl(card.cover.url)}
          />
        )}
        {card.seasonLabel && (
          <Badge className="absolute top-3 left-3" size="xs" variant="lime">
            {card.seasonLabel}
          </Badge>
        )}
        <Badge className="absolute right-3 bottom-3 gap-1.75" size="xs" variant="glass">
          <ImageIcon size={13} strokeWidth={2.4} />
          {countLabel(card.photoCount, ['fotka', 'fotky', 'fotek'])}
        </Badge>
      </div>
      {/* flex-1 + mt-auto v CardCta: odkaz drží u spodní hrany i u kratších titulků */}
      <div className="flex flex-1 flex-col px-2.5 pt-4">
        <div className="text-faint text-caption font-bold">{card.dateLabel}</div>
        <CardTitle className="mt-2 line-clamp-3" size="sm">
          {card.title}
        </CardTitle>
        <CardCta className="pt-3">Otevřít galerii</CardCta>
      </div>
    </CardShell>
  )
}
