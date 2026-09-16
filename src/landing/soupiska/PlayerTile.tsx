import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { CardTitle } from '../components/Heading'
import { Eyebrow } from '../components/Kicker'
import { Numeral } from '../components/Numeral'
import { PatternBackground } from '../components/PatternBackground'
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
 * Karta hráče: portrét v pevném `4/5` rámečku nad bílým blokem s popiskem.
 *
 * Rámeček řeší tři věci, které dřív dělaly z mřížky patchwork:
 *
 * - **Podklad `bg-pine`.** Portréty jsou mugshoty na bílém pozadí a karta je
 *   taky bílá, takže hlava „plavala" a každý řádek měl jinou světlost. Tmavý
 *   box hlavu orámuje a sjednotí expozici napříč mřížkou; spodní gradient
 *   z `pine-deep` k tomu dává jednotné ukotvení pod bradou. Fotka se proto
 *   **neztrácí maskou do bílé** jako dřív — zdroj toho efektu (bílé pozadí
 *   mugshotu) je tu naopak to, co se schovává.
 * - **Číslo dresu je uvnitř fotky**, ne přilepené na její hraně: lime pilulka
 *   `rounded-badge` v pravém dolním rohu, kde gradient garantuje kontrast.
 *   Hráč **bez čísla** dostane tutéž pilulku ve variantě `chip` s pomlčkou —
 *   bez ní se řádku rozpadl vizuální rytmus (dřív plaketa prostě zmizela).
 * - **Bez fotky se kreslí vzor**, ne prázdná bílá plocha. `circuit` v klubové
 *   zelené s `fade="center"` a obrysové iniciály nad ním; na mobilu to dřív
 *   bylo ~350 px prázdna.
 *
 * Karta není klikací — hráči nemají detailové stránky.
 *
 * Mobilní odchylky od handoffu, který kreslí jen 258px karty:
 *
 * - Karta je ve dvou sloupcích na 320px široká 140 px, takže fixní minimum
 *   `5rem` u iniciál (handoff `clamp(80px,8vw,108px)`) přeteklo přes obě
 *   hrany. Monogram se proto pod `md` váže na šířku viewportu (~18vw), což
 *   drží stejný podíl plochy karty jako na desktopu.
 * - Popisek nesmí narůst do třetí řádky — dlouhé role by přerostly kartu.
 * - Blok popisku má **pevnou minimální výšku**, aby karty v řádku mřížky
 *   držely stejný vnitřní rytmus i při dvouřádkovém jménu.
 */
export function PlayerTile({ card }: { card: SoupiskaCard }) {
  return (
    <div className="border-line-soft rounded-panel overflow-hidden border bg-surface">
      <div className="bg-pine relative aspect-[4/5] overflow-hidden">
        {card.photo ? (
          <Image
            alt={card.photo.alt}
            className="object-cover"
            fill
            /* Zlomy kopírují třístupňovou mřížku v `RosterSection`: dva
               sloupce pod `md`, minmax 208px na tabletu, 258px od `lg`. */
            sizes="(max-width: 48rem) 50vw, (max-width: 64rem) 15rem, 18rem"
            src={getMediaUrl(card.photo.url, card.photo.updatedAt)}
          />
        ) : (
          <>
            <PatternBackground fade="center" tone="lime" variant="circuit" />
            <div
              aria-hidden
              className="text-stroke absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(2.75rem,18vw,6.75rem)] leading-none font-extrabold tracking-[-0.05em] text-white/35 select-none md:text-[clamp(5rem,8vw,6.75rem)]"
            >
              {initials(card.name)}
            </div>
          </>
        )}

        {/* Scrim pod číslem — musí držet kontrast lime pilulky i nad světlým
            mugshotem, proto sahá až do 45 % výšky. */}
        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(180deg,--alpha(var(--color-pine-deep)/0%)_45%,--alpha(var(--color-pine-deep)/72%))]" />

        {card.number != null ? (
          <Numeral
            as="div"
            className="bg-lime rounded-badge text-ink absolute right-3 bottom-3 px-2.5 py-0.5"
            size="lg"
          >
            #{card.number}
          </Numeral>
        ) : (
          /* Pomlčka místo čísla: staff a hráči bez dresu drží stejnou kotvu
             v rohu, takže se mřížka nerozjede. `bg-chip` je neutrální —
             lime patří číslu. */
          <Numeral
            aria-hidden
            as="div"
            className="bg-chip rounded-badge text-ink-soft absolute right-3 bottom-3 px-2.5 py-0.5"
            size="lg"
          >
            —
          </Numeral>
        )}
      </div>

      <div className="min-h-[3.25rem] px-3.5 pt-3 pb-4 md:min-h-[3.5rem] md:px-5 md:pt-3.5 md:pb-4.5">
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
