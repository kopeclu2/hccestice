import Image from 'next/image'
import React from 'react'

import type { CardTitleProps } from '@/landing/ui/Heading'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { initials } from '@/lib/teamName'
import { cn } from '@/lib/utils'

import type { RosterCard } from './PlayerTile'

/** Šikmá horní hrana lišty: 14 px dole vlevo, nahoře vpravo (jako dresový štítek). */
const SLANT = '[clip-path:polygon(0_14px,100%_0,100%_100%,0_100%)]'

/**
 * Karta hráče „dresový štítek": fotka přes celou kartu a dole šikmá tmavá
 * lišta s limetkovým okrajem, ve které je číslo, post a jméno. Číslo ani
 * statistiky nepřekrývají obličej — lišta zabírá jen spodní čtvrtinu.
 * Statistiky (Z/G/A/B/TM) karta záměrně nemá; `card.stats` se ignoruje.
 *
 * Bez fotky je karta bílá s obrysovými iniciálami nad rastrem. Realizační tým
 * (`number === null`) má lištu bez čísla.
 */
export function PlayerTileJersey({
  card,
  titleAs = 'h3',
}: {
  card: RosterCard
  titleAs?: CardTitleProps['as']
}) {
  return (
    <div
      className={cn(
        'relative aspect-[1/1.4] overflow-hidden rounded-panel',
        card.photo ? 'bg-pine' : 'border border-line-soft bg-surface',
      )}
    >
      {card.photo ? (
        <Image
          alt={card.photo.alt}
          className="object-cover object-top"
          fill
          sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 15rem, 18rem"
          src={getMediaUrl(card.photo.url, card.photo.updatedAt)}
        />
      ) : (
        <>
          <div className="absolute inset-0 hatch [mask-image:linear-gradient(180deg,#000,transparent_75%)]" />
          <div
            aria-hidden
            className="absolute inset-x-0 top-[34%] -translate-y-1/2 text-center text-jersey leading-none font-extrabold tracking-tighter text-club/35 select-none text-stroke md:text-jersey-md"
          >
            {initials(card.name, { skipAbbreviations: true, upper: false })}
          </div>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0">
        <div aria-hidden className={`absolute inset-x-0 top-[-5px] bottom-0 bg-lime ${SLANT}`} />
        <div
          className={`relative bg-gradient-to-b from-pine to-pine-deep px-3 pt-5 pb-3 md:px-4 md:pt-6 md:pb-4 ${SLANT}`}
        >
          <div className="flex items-center gap-2.5 md:gap-3">
            {card.number != null && (
              <Numeral
                as="div"
                className="min-w-[1.6em] shrink-0 -skew-x-6 rounded-chip bg-lime px-1 py-1 text-center leading-none text-pine max-md:text-xl"
                size="lg"
              >
                {card.number}
              </Numeral>
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <Eyebrow className="line-clamp-2" tight tone="lime">
                {card.kicker}
              </Eyebrow>
              <CardTitle
                as={titleAs}
                className="line-clamp-2 text-sm leading-heading text-on-contrast md:text-lg"
                size="sm"
              >
                {card.name}
              </CardTitle>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
