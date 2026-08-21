import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from './Badge'
import { CardCta, CardShell } from './CardGrid'
import { CardTitle } from './Heading'
import type { PostCard } from '../types'

/**
 * Karta článku — štítek, datum, titulek a úryvek textu.
 *
 * Náhledová fotka je **vypnutá defaultně**: naimportované články mají různě
 * kvalitní obrázky, často jen zmenšeniny z eStránky. Zapíná ji `withPhoto`
 * (přepínač „Zobrazit fotku u článku" na widgetu Aktuality), takže si správce
 * může vybrat podle toho, jak kvalitní fotky články zrovna mají.
 *
 * Jedna komponenta pro výpis `/aktuality` i pro widget Aktuality na úvodní
 * straně — obě mřížky mají mít stejnou kartu, aby proklik z home nevypadal
 * jako jiný web.
 */
export function ArticleCard({
  card,
  withPhoto = false,
  /* Zlomy kopírují `CardGrid`: 1 sloupec / 2 od `sm` / 3 od `lg`. Bez
     prostředního kroku si karta na tabletu tahala fotku na dvojnásobek
     své šířky. */
  sizes = '(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw',
}: {
  card: PostCard
  /** Náhledová fotka nad textem; bez fotky karta degraduje na textovou. */
  withPhoto?: boolean
  /** `sizes` pro next/image podle šířky karty v mřížce. */
  sizes?: string
}) {
  const photo = withPhoto ? card.photo : null

  return (
    <CardShell href={card.href} pad={photo ? 'media' : 'text'}>
      {/* Pruh 2:1, ne 4:3 jako karty galerie — u aktualit je fotka doplněk
          titulku, ne obsah karty; na 4:3 zabírala víc plochy než text. */}
      {photo && (
        <div className="bg-pine relative aspect-[2/1] overflow-hidden rounded-badge">
          <Image
            alt={photo.alt}
            className="object-cover"
            fill
            sizes={sizes}
            src={getMediaUrl(photo.url)}
          />
        </div>
      )}
      {/* flex-1 + mt-auto v CardCta: odkaz drží u spodní hrany i u kratších titulků */}
      <div className={photo ? 'flex flex-1 flex-col px-2.5 pt-4' : 'flex flex-1 flex-col'}>
        <div className="flex items-center gap-2.5">
          <Badge size="xs" variant="lime">
            {card.tag}
          </Badge>
          <div className="text-faint text-caption font-bold">{card.dateLabel}</div>
        </div>
        {/* `min-h-[2lh]` drží u varianty s fotkou dva řádky i pro krátký titulek:
            bez toho začíná úryvek na každé kartě v jiné výšce. */}
        <CardTitle
          className={photo ? 'mt-2.5 line-clamp-2 min-h-[2lh]' : 'mt-2.5 line-clamp-3'}
          size="sm"
        >
          {card.title}
        </CardTitle>
        {/* S fotkou se odstavec vykreslí i prázdný — článek bez úryvku (soupisky,
            rozpisy) by jinak měl kartu o dva řádky nižší než sousedi. */}
        {(photo || card.excerpt) && (
          <p
            className={
              photo
                ? 'text-faint mt-2.5 line-clamp-2 min-h-[2lh] text-body leading-[1.5] text-pretty'
                : 'text-faint mt-2.5 line-clamp-4 text-body leading-[1.5] text-pretty'
            }
          >
            {card.excerpt}
          </p>
        )}
        <CardCta className={photo ? 'pt-3' : undefined}>Číst článek</CardCta>
      </div>
    </CardShell>
  )
}
