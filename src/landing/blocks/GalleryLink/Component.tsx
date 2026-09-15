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
 * Odkaz na galerii v rich textu — přes celou šířku článku, ne mřížka
 * náhledů jako `GalleryEmbedWidget`. Pro editora, který chce jen proklik
 * („podívejte se na fotky ze zápasu"), ne celou galerii vloženou do textu.
 *
 * Přes celou šířku sloupce záměrně, ne úzká karta na pevnou šířku (`max-w`):
 * omezená karta uprostřed široké obsahové plochy vypadala jako nedopatření
 * (foto zabírá jen zlomek řádku, zbytek prázdný).
 *
 * Na mobilu je miniatura nad textem přes celou šířku (`flex-col`), ne vedle
 * něj — vodorovný řádek na 390px zbyde na titulek necelých 200px (šířka
 * karty minus miniatura, mezery a kruh se šipkou), takže se delší název
 * galerie ořízl uprostřed slova. Od `sm` (640px) je řádku dost na miniaturu
 * i titulek vedle sebe. Datum se nezobrazuje zvlášť — bývá součástí
 * titulku, druhý řádek s ním byl duplicitní.
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
          className="border-line-soft hover:border-club group relative flex flex-col overflow-hidden rounded-card border bg-surface transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-3 md:p-4"
          href={card.href!}
        >
          <div className="bg-pine relative aspect-video flex-none overflow-hidden sm:aspect-[4/3] sm:w-32 sm:rounded-panel md:w-40">
            {card.cover && (
              <Image
                alt={card.cover.alt}
                className="object-cover"
                fill
                sizes="(max-width: 40rem) 100vw, (max-width: 48rem) 8rem, 10rem"
                src={getMediaUrl(card.cover.url, card.cover.updatedAt)}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 p-3 sm:p-0">
            <CardTitle className="line-clamp-2" size="xs">
              {label || card.title}
            </CardTitle>
            <div className="text-faint mt-1.5 flex items-center gap-1.5 text-caption font-semibold">
              <ImageIcon size={13} strokeWidth={2.4} />
              {countLabel(card.photoCount, ['fotka', 'fotky', 'fotek'])}
            </div>
          </div>

          <span className="bg-lime text-ink group-hover:bg-club absolute top-3 right-3 grid size-9 flex-none place-items-center rounded-full transition-colors group-hover:text-white sm:static [&_svg]:size-4">
            <ArrowUpRight strokeWidth={2.5} />
          </span>
        </Link>
      </Reveal>
    </SectionShell>
  )
}
