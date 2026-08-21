import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { Numeral } from '../components/Numeral'
import type { Photo } from '../types'

/** Karta na soupisce — hráč (kicker = post, číslo) i člen realizačního týmu (kicker = role). */
export type SoupiskaCard = {
  key: string
  name: string
  /** Zelený uppercase štítek nad jménem — post hráče, u staffu role. */
  kicker: string
  number: number | null
  photo: Photo | null
}

/** Iniciály pro kartu bez fotky — první 2 slova, tituly a „st./ml." se přeskočí. */
const initials = (name: string): string =>
  name
    .split(' ')
    .filter((word) => word && !word.endsWith('.'))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')

/**
 * Bílá karta hráče dle handoffu „Soupiska": fotka se ztrácí dolů do bílé,
 * číslo dresu v limetkovém bloku, zelený kicker a jméno. Bez fotky se
 * kreslí velké obrysové iniciály nad diagonálním rastrem. Karta není
 * klikací — hráči nemají detailové stránky.
 *
 * Mobilní odchylky od handoffu, který kreslí jen 258px karty:
 *
 * - Karta je ve dvou sloupcích na 320px široká 140 px, takže fixní minimum
 *   `5rem` u iniciál (handoff `clamp(80px,8vw,108px)`) přeteklo přes obě
 *   hrany. Monogram se proto pod `md` váže na šířku viewportu (~18vw), což
 *   drží stejný podíl plochy karty jako na desktopu. Zároveň je posazený
 *   výš (30 % místo 38 %), aby ho limetková plaketa s číslem nepřekryla —
 *   na 258px kartě je mezi nimi místo, na 140px už ne.
 * - Fotka se do bílé ztrácí dřív (mask 40/84 % místo 58/97 %). Role
 *   realizačního týmu („Asistent trenéra mužů") se na dvě řádky nevejde
 *   do bílého pruhu a zelený text ležel na obličeji.
 * - Popisek nesmí narůst do třetí řádky — dlouhé role by přerostly kartu.
 */
export function PlayerTile({ card }: { card: SoupiskaCard }) {
  return (
    <div className="border-line-soft rounded-panel relative aspect-[1/1.18] overflow-hidden border bg-surface">
      {card.photo ? (
        <div className="absolute inset-x-0 top-0 h-4/5 [mask-image:linear-gradient(180deg,#000_40%,transparent_84%)] md:[mask-image:linear-gradient(180deg,#000_58%,transparent_97%)]">
          <Image
            alt={card.photo.alt}
            className="object-cover"
            fill
            sizes="(max-width: 48rem) 50vw, 18rem"
            src={getMediaUrl(card.photo.url)}
          />
        </div>
      ) : (
        <>
          <div className="hatch absolute inset-0 [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
          <div
            aria-hidden
            className="text-club/35 text-stroke absolute inset-x-0 top-[30%] -translate-y-1/2 text-center md:top-[38%] text-[clamp(2.75rem,18vw,6.75rem)] leading-none md:text-[clamp(5rem,8vw,6.75rem)] font-extrabold tracking-[-0.05em] select-none"
          >
            {initials(card.name)}
          </div>
        </>
      )}

      {card.number != null && (
        <Numeral as="div" className="absolute right-3.5 bottom-15" size="lg">
          <span className="bg-lime box-decoration-clone px-2.5 py-0.5">#{card.number}</span>
        </Numeral>
      )}

      <div className="absolute inset-x-3.5 bottom-4 md:inset-x-5 md:bottom-4.5">
        <Eyebrow
          className="text-club max-md:line-clamp-2 max-md:tracking-[0.08em]"
          tone="club"
          wide
        >
          {card.kicker}
        </Eyebrow>
        {/* `truncate` (whitespace-nowrap) na jméně nezabíralo — `text-pretty`
            z `CardTitle sm` ho v pořadí utilit přebíjí, takže se dlouhá jména
            stejně lámala. Strop dvě řádky proto platí až do `lg`, výpustka
            podle handoffu jen od `lg`: na tabletu je karta 177px široká a
            „Jaroslav Macháček" (198px) i „Ing. Lukáš Beránek" (193px) se
            sekaly, zatímco na 1024px a víc se obojí vejde. */}
        <CardTitle
          as="h4"
          className="mt-1 max-lg:line-clamp-2 max-md:text-caption lg:truncate"
          size="sm"
        >
          {card.name}
        </CardTitle>
      </div>
    </div>
  )
}
