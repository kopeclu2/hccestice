import { Newspaper } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from './Badge'
import { CardCta, CardShell } from './CardGrid'
import { CardTitle } from './Heading'
import { PatternBackground } from './PatternBackground'
import type { PostCard } from '../types'

/**
 * Karta článku — náhled, štítek, datum, titulek a úryvek textu.
 *
 * Náhled je **zapnutý defaultně** (`withPhoto`): klub má tisíce fotek a čistě
 * textové karty z výpisu dělaly seznam odkazů. Článek bez vlastní fotky
 * nespadne zpátky na text — dostane vzorovou plochu (`PatternBackground`
 * `circuit`) s ikonou, takže mřížka drží stejný rytmus i tam, kde fotka není.
 * Nová datová závislost kvůli tomu nevzniká: pár článek↔galerie v datové
 * vrstvě neexistuje a dohledávat ho dotazem navíc u každé karty výpisu by
 * stálo víc, než kolik přinese.
 *
 * `withPhoto={false}` zbyde pro textovou variantu (hustý výpis souvisejících
 * článků). Ta má nad „Číst článek" dělicí linku — mezi zkráceným úryvkem
 * a odkazem jinak zůstávala prázdná plocha, která vypadala jako chyba
 * layoutu, ne jako záměr.
 *
 * `featured` je první karta výpisu: širší dlaždice (`lg:col-span-2` řeší
 * volající), fotka 16:9 a od `lg` text vedle fotky, ne pod ní.
 *
 * Jedna komponenta pro výpis `/aktuality` i pro widget Aktuality na úvodní
 * straně — obě mřížky mají mít stejnou kartu, aby proklik z home nevypadal
 * jako jiný web.
 */
export function ArticleCard({
  card,
  className,
  featured = false,
  withPhoto = true,
  /* Zlomy kopírují `CardGrid`: 1 sloupec / 2 od `sm` / 3 od `lg`. Bez
     prostředního kroku si karta na tabletu tahala fotku na dvojnásobek
     své šířky. */
  sizes = '(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw',
}: {
  card: PostCard
  /** Třídy obalu karty — typicky `lg:col-span-2` u featured dlaždice. */
  className?: string
  /** Hlavní karta výpisu — širší dlaždice, 16:9 náhled, text vedle fotky. */
  featured?: boolean
  /** Náhled nad textem; `false` = textová varianta bez media plochy. */
  withPhoto?: boolean
  /** `sizes` pro next/image podle šířky karty v mřížce. */
  sizes?: string
}) {
  const photo = withPhoto ? card.photo : null
  const hasMedia = withPhoto

  return (
    <CardShell
      className={cn(featured && 'lg:flex-row lg:items-stretch', className)}
      href={card.href}
      pad={hasMedia ? 'media' : 'text'}
    >
      {/* Pruh 2:1, ne 4:3 jako karty galerie — u aktualit je fotka doplněk
          titulku, ne obsah karty; na 4:3 zabírala víc plochy než text.
          Featured karta má 16:9 na obou stupních — dřív se na desktopu
          natahovala na výšku textového sloupce (`lg:aspect-auto`), takže
          u krátkého titulku vyšla fotka ~3:1 a běžná týmovka se v ní
          uřízla. Pevný poměr je pro editora předvídatelný bez ohledu na
          délku perexu. */}
      {hasMedia && (
        <div
          className={cn(
            'bg-pine relative aspect-video overflow-hidden rounded-badge',
            featured ? 'lg:w-[55%] lg:shrink-0' : 'aspect-[2/1]',
          )}
        >
          {photo ? (
            <Image
              alt={photo.alt}
              className="object-cover"
              fill
              sizes={sizes}
              src={getMediaUrl(photo.url, photo.updatedAt)}
            />
          ) : (
            /* Bez fotky: vzor v klubové zelené místo prázdného tmavého pruhu.
               `bg-chip`, ne `bg-pine` — plocha bez fotky se nemá tvářit jako
               fotka, která se nenačetla. */
            <div className="bg-chip absolute inset-0 grid place-items-center">
              <PatternBackground fade="center" tone="club" variant="circuit" />
              <span
                className={cn(
                  'text-club/40 relative',
                  featured ? '[&_svg]:size-14' : '[&_svg]:size-9',
                )}
              >
                <Newspaper strokeWidth={1.5} />
              </span>
            </div>
          )}
        </div>
      )}
      {/* flex-1 + mt-auto v CardCta: odkaz drží u spodní hrany i u kratších titulků */}
      <div
        className={cn(
          'flex flex-1 flex-col',
          hasMedia && 'px-2.5 pt-4',
          featured && 'lg:justify-center lg:px-5 lg:py-4',
        )}
      >
        <div className="flex items-center gap-2.5">
          <Badge size="xs" variant="lime">
            {card.tag}
          </Badge>
          <div className="text-faint text-caption font-bold">{card.dateLabel}</div>
        </div>
        {/* `min-h-[2lh]` drží u varianty s náhledem dva řádky i pro krátký
            titulek: bez toho začíná úryvek na každé kartě v jiné výšce.
            U featured karty ne — stojí v řádku sama. */}
        <CardTitle
          className={cn(
            'mt-2.5',
            featured ? 'line-clamp-3' : hasMedia ? 'line-clamp-2 min-h-[2lh]' : 'line-clamp-3',
          )}
          size={featured ? 'lg' : 'sm'}
        >
          {card.title}
        </CardTitle>
        {/* S náhledem se odstavec vykreslí i prázdný — článek bez úryvku
            (soupisky, rozpisy) by jinak měl kartu o dva řádky nižší než sousedi. */}
        {(hasMedia || card.excerpt) && (
          <p
            className={cn(
              'text-faint mt-2.5 text-body leading-[1.5] text-pretty',
              /* Featured karta stojí ve svém řádku sama, takže se nemá k čemu
                 zarovnávat — `min-h` by pod krátkým perexem udělalo prázdno. */
              featured
                ? 'line-clamp-3 lg:max-w-130'
                : hasMedia
                  ? 'line-clamp-2 min-h-[2lh]'
                  : 'line-clamp-4',
            )}
          >
            {card.excerpt}
          </p>
        )}
        {/* Textová varianta: linka odděluje CTA od prázdna pod zkráceným
            úryvkem. S náhledem linku nepotřebuje — kartu drží pohromadě fotka. */}
        <CardCta
          className={cn(
            hasMedia ? 'pt-3' : 'border-line-soft border-t pt-3.5',
            /* `mt-auto` z `CardCta` drží odkaz u spodní hrany karty. U featured
               karty je text od `lg` vedle fotky a vertikálně vystředěný, takže
               by odkaz zůstal sám dole s ~180px prázdna nad sebou. */
            featured && 'lg:mt-5 lg:pt-0',
          )}
        >
          Číst článek
        </CardCta>
      </div>
    </CardShell>
  )
}
