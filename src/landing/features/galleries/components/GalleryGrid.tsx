import { Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { GalleryCard } from '@/landing/features/galleries/types'
import { PHOTO_FORMS } from '@/landing/features/galleries/view/galleryMeta'
import { Badge } from '@/landing/ui/Badge'
import { CardCta, CardGrid, CardShell } from '@/landing/ui/CardGrid'
import { EmptyState } from '@/landing/ui/EmptyState'
import { CardTitle } from '@/landing/ui/Heading'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { countLabel } from '@/lib/plural'
import { routes } from '@/lib/routes'

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
    <CardGrid empty={<GalleryEmpty activeSeasonLabel={activeSeasonLabel ?? null} />} items={cards}>
      {(card, index) => <GalleryCardTile card={card} index={index} key={card.id} />}
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
          <Button asChild size="md" variant="dark" withArrow>
            <Link href="/#kontakt">Poslat fotky</Link>
          </Button>
          {activeSeasonLabel && (
            <Button asChild size="md" variant="outline">
              <Link href={`${routes.list.galleries}#seznam`}>Starší sezóny</Link>
            </Button>
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
          Fotogalerie ze sezóny <strong className="font-semibold">{activeSeasonLabel}</strong> se
          teprve plní. Máš fotky ze zápasů? Pošli nám je, rádi je zveřejníme.
        </>
      ) : (
        <>
          Fotoalbum se teprve plní. Máš fotky ze zápasů nebo z akcí klubu? Pošli nám je, rádi je
          zveřejníme.
        </>
      )}
    </EmptyState>
  )
}

/**
 * Karta galerie: titulní fotka v poměru 4:3 (jednotná výška řádku),
 * lime pill sezóny vlevo nahoře, glass badge s počtem fotek vpravo dole.
 *
 * Jen první karta je `eager` + `fetchPriority="high"` (LCP kandidát).
 * Next u každého eager obrázku přidá `<link rel="preload">`, takže další
 * eager karty by se o šířku pásma přetahovaly s LCP fotkou: s třemi bylo
 * LCP na mobilu v labu o ~0,5 s horší než s jednou.
 */
function GalleryCardTile({ card, index }: { card: GalleryCard; index: number }) {
  return (
    <CardShell href={card.href} pad="media">
      <div className="relative aspect-4/3 overflow-hidden rounded-badge bg-pine">
        {card.cover && (
          <Image
            alt={card.cover.alt}
            className="object-cover"
            fetchPriority={index === 0 ? 'high' : undefined}
            fill
            loading={index === 0 ? 'eager' : 'lazy'}
            /* Zlomy kopírují `CardGrid`: 1 sloupec / 2 od `sm` (40rem) /
               3 od `lg` (64rem). Od `lg` je sloupec nejvýš ~30rem
               (`max-w-page` 97,5rem ÷ 3), takže `33vw` na širokém monitoru
               přeceňovalo. */
            sizes="(min-width: 64rem) min(33vw, 30rem), (min-width: 40rem) 50vw, 100vw"
            src={getMediaUrl(card.cover.url, card.cover.updatedAt)}
          />
        )}
        {card.seasonLabel && (
          <Badge className="absolute top-3 left-3" size="xs" variant="lime">
            {card.seasonLabel}
          </Badge>
        )}
        <Badge className="absolute right-3 bottom-3 gap-1.75" size="xs" variant="glass">
          <ImageIcon size={13} strokeWidth={2.4} />
          {countLabel(card.photoCount, PHOTO_FORMS)}
        </Badge>
      </div>
      {/* flex-1 + mt-auto v CardCta: odkaz drží u spodní hrany i u kratších titulků */}
      <div className="flex flex-1 flex-col px-2.5 pt-4">
        <div className="text-xs font-semibold text-faint">{card.dateLabel}</div>
        <CardTitle className="mt-2 line-clamp-3" size="sm">
          {card.title}
        </CardTitle>
        <CardCta className="pt-3">Otevřít galerii</CardCta>
      </div>
    </CardShell>
  )
}
