import type { GalleryLinkBlock } from '@/payload-types'

import { ArrowUpRight, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../../components/Heading'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { countLabel, relId } from '../../data/format'
import { fetchGallery, toGalleryCard } from '../../data/galleries'
import type { GalleryCard } from '../../types'

/**
 * Odkaz na galerii v rich textu — jeden řádek s náhledovou fotkou, ne
 * mřížka náhledů jako `GalleryEmbedWidget`. Pro editora, který chce jen
 * proklik („podívejte se na fotky ze zápasu"), ne celou galerii vloženou
 * do článku.
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
          className="border-line-soft hover:border-club group flex items-center gap-4 rounded-card border bg-surface p-3.5 transition-colors md:p-4"
          href={card.href!}
        >
          <div className="bg-pine relative aspect-square w-16 flex-none overflow-hidden rounded-panel md:w-20">
            {card.cover && (
              <Image
                alt={card.cover.alt}
                className="object-cover"
                fill
                sizes="5rem"
                src={getMediaUrl(card.cover.url, card.cover.updatedAt)}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2" size="xs">
              {label || card.title}
            </CardTitle>
            <div className="text-faint mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption font-semibold">
              {card.dateLabel && <span>{card.dateLabel}</span>}
              <span className="inline-flex items-center gap-1.25">
                <ImageIcon size={13} strokeWidth={2.4} />
                {countLabel(card.photoCount, ['fotka', 'fotky', 'fotek'])}
              </span>
            </div>
          </div>

          <span className="bg-lime text-ink group-hover:bg-club grid size-9 flex-none place-items-center rounded-full transition-colors group-hover:text-white [&_svg]:size-4">
            <ArrowUpRight strokeWidth={2.5} />
          </span>
        </Link>
      </Reveal>
    </SectionShell>
  )
}
