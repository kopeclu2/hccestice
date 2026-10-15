import Image from 'next/image'
import React from 'react'

import type { Photo } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { initials } from '@/lib/teamName'

/** Karta na soupisce — hráč (kicker = post, číslo) i člen realizačního týmu (kicker = role). */
export type RosterCard = {
  key: string
  name: string
  /** Zelený uppercase štítek nad jménem — post hráče, u staffu role. */
  kicker: string
  number: number | null
  photo: Photo | null
  /**
   * Statistika za sezónu. `goalie` skryje G/A/B/TM (u brankáře by byly samé
   * nuly); null = hráč nemá odehraný zápas, nezobrazí se nic.
   */
  stats?: { games: number; goals: number; assists: number; pim: number; goalie: boolean } | null
}

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
 * - Blok popisku má **pevnou minimální výšku**. Je kotvený ke spodní hraně,
 *   takže dvouřádkové jméno ho dřív vytlačilo nahoru: kicker se dostal do
 *   linky s limetkovou plaketou čísla a karta měla jiný vnitřní rytmus než
 *   sousedi v řádku mřížky. Teď dvouřádkové jméno roste dolů.
 */
export function PlayerTile({ card }: { card: RosterCard }) {
  return (
    <div className="relative aspect-[1/1.18] overflow-hidden rounded-panel border border-line-soft bg-surface">
      {card.photo ? (
        <div className="absolute inset-x-0 top-0 h-4/5 [mask-image:linear-gradient(180deg,#000_40%,transparent_84%)] md:[mask-image:linear-gradient(180deg,#000_58%,transparent_97%)]">
          <Image
            alt={card.photo.alt}
            className="object-cover"
            fill
            /* Zlomy kopírují třístupňovou mřížku v `RosterSection`: dva
               sloupce pod `md`, minmax 208px na tabletu, 258px od `lg`. */
            sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 15rem, 18rem"
            src={getMediaUrl(card.photo.url, card.photo.updatedAt)}
          />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 hatch [mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
          <div
            aria-hidden
            className="absolute inset-x-0 top-[30%] -translate-y-1/2 text-center text-[clamp(2.75rem,18vw,6.75rem)] leading-none font-extrabold tracking-[-0.05em] text-club/35 select-none text-stroke md:top-[38%] md:text-[clamp(5rem,8vw,6.75rem)]"
          >
            {initials(card.name, { skipAbbreviations: true, upper: false })}
          </div>
        </>
      )}

      {card.stats && <SeasonStats stats={card.stats} />}

      {card.number != null && (
        <Numeral as="div" className="absolute right-3.5 bottom-15" size="lg">
          <span className="bg-lime box-decoration-clone px-2.5 py-0.5">#{card.number}</span>
        </Numeral>
      )}

      <div className="absolute inset-x-3.5 bottom-4 min-h-[3.25rem] md:inset-x-5 md:bottom-4.5 md:min-h-[3.5rem]">
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
          className="mt-1 max-lg:line-clamp-2 max-md:text-xs lg:truncate"
          size="sm"
        >
          {card.name}
        </CardTitle>
      </div>
    </div>
  )
}

/**
 * Pilulka Z / G / A / B / TM v rohu fotky. Tmavé sklo (`glass`) čte na každé
 * fotce i na rastru bez fotky. Vizuální zkratky jsou pro čtečku zbytečně
 * stručné, takže nese celý popis v `aria-label`.
 */
function SeasonStats({ stats }: { stats: NonNullable<RosterCard['stats']> }) {
  const items: Array<[string, number]> = stats.goalie
    ? [['Z', stats.games]]
    : [
        ['Z', stats.games],
        ['G', stats.goals],
        ['A', stats.assists],
        ['B', stats.goals + stats.assists],
        ['TM', stats.pim],
      ]
  const label = stats.goalie
    ? `Zápasů v sezóně: ${stats.games}`
    : `Zápasů ${stats.games}, branek ${stats.goals}, asistencí ${stats.assists}, bodů ${stats.goals + stats.assists}, trestných minut ${stats.pim}`

  return (
    <Badge
      aria-label={label}
      className="absolute top-2.5 left-2.5 gap-2 px-2.5 tabular-nums md:top-3.5 md:left-3.5 md:gap-2.5 md:px-3"
      role="group"
      size="xs"
      variant="glass"
    >
      {/* TM až od `md`: ve dvousloupcové mřížce na mobilu (karta 130–150px)
          pilulka s pěti položkami přetéká a `overflow-hidden` ji ustřihne
          (změřeno na 320 a 360px). Čtečka ji má v `aria-label` vždy. */}
      {items.map(([key, value]) => (
        <span aria-hidden className={key === 'TM' ? 'hidden md:inline' : undefined} key={key}>
          <span className="text-white/60">{key}</span> {value}
        </span>
      ))}
    </Badge>
  )
}
