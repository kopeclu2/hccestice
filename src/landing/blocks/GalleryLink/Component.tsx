import type { GalleryLinkBlock } from '@/payload-types'

import { ArrowUpRight, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from '../../components/Badge'
import { CardTitle } from '../../components/Heading'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { countLabel, relId } from '../../data/format'
import { fetchGallery, toGalleryCard } from '../../data/galleries'
import type { GalleryCard } from '../../types'

/**
 * Odkaz na galerii v rich textu — jedna kompaktní karta (foto nahoře přes
 * celou šířku, text pod ním), ne mřížka náhledů jako `GalleryEmbedWidget`.
 * Pro editora, který chce jen proklik („podívejte se na fotky ze zápasu"),
 * ne celou galerii vloženou do článku.
 *
 * Svislý layout, ne vodorovný řádek s malou čtvercovou fotkou: delší
 * název galerie (běžně obsahuje datum i soupeře, „11.1.2017 Čestice x
 * Skuteč - WINTER CLASSIC") se v úzkém sloupci vedle miniatury na mobilu
 * ořízl uprostřed slova. Svislá karta dá titulku celou šířku karty.
 * Datum se navíc nezobrazuje zvlášť — bývá součástí titulku, druhý řádek
 * s ním byl duplicitní.
 */
export async function GalleryLinkBlockComponent({ block }: { block: GalleryLinkBlock }) {
  const galleryId = relId(block.gallery)
  if (!galleryId) return null
  const gallery = await fetchGallery(galleryId)
  if (!gallery) return null
  const card = toGalleryCard(gallery)
  if (!card.href) return null
  return <GalleryLinkView card={card} label={block.label} />
}

function GalleryLinkView({ card, label }: { card: GalleryCard; label?: string | null }) {
  return (
    <SectionShell>
      <Reveal>
        <Link
          className="border-line-soft hover:border-club group block max-w-100 overflow-hidden rounded-card border bg-surface transition-colors"
          href={card.href!}
        >
          <div className="bg-pine relative aspect-video overflow-hidden">
            {card.cover && (
              <Image
                alt={card.cover.alt}
                className="object-cover"
                fill
                sizes="25rem"
                src={getMediaUrl(card.cover.url, card.cover.updatedAt)}
              />
            )}
            <Badge className="absolute right-3 bottom-3 gap-1.75" size="xs" variant="glass">
              <ImageIcon size={13} strokeWidth={2.4} />
              {countLabel(card.photoCount, ['fotka', 'fotky', 'fotek'])}
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3.5 md:p-4">
            <CardTitle className="line-clamp-2 min-w-0 flex-1" size="xs">
              {label || card.title}
            </CardTitle>
            <span className="bg-lime text-ink group-hover:bg-club grid size-9 flex-none place-items-center rounded-full transition-colors group-hover:text-white [&_svg]:size-4">
              <ArrowUpRight strokeWidth={2.5} />
            </span>
          </div>
        </Link>
      </Reveal>
    </SectionShell>
  )
}
