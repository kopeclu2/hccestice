import React from 'react'

import { cn } from '@/utilities/ui'

import { Countdown } from '../blocks/Hero/Countdown'
import { CardTitle } from './Heading'
import { Eyebrow } from './Kicker'

/**
 * Tmavý panel nejbližšího zápasu s živým odpočtem.
 *
 * Jeden vzhled pro dvě místa, která ho dřív měla každé po svém:
 * widget **Nejbližší zápas** (`blocks/NextMatchWidget`) a **jediný**
 * nadcházející zápas v rozpisu (`zapasy/FixturesRail`). Mimo sezónu je
 * v termínovce často právě jeden zápas a užší karta z pásu v něm nechávala
 * přes 900px prázdna — místo ní se vykreslí tenhle panel přes celou sekci.
 *
 * `Countdown` je klientská komponenta z hero bloku, ale na hero nijak
 * navázaná není (bere jen ISO cíle), takže se přebírá, ne kopíruje.
 *
 * Dva layouty:
 * - `stack` — vše pod sebou (widget; přesně jak vypadal předtím),
 * - `wide`  — od `lg` dva sloupce: vlevo týmy a datum (`meta`), vpravo
 *   odpočet a CTA (`actions`). Pod `lg` spadne zpátky pod sebe.
 *
 * Radius je volitelný, protože každé místo sedí v jiném kontextu:
 * `card` (36px) je velká sekční karta widgetu, `section` (30px) pás uvnitř
 * sekce s vlastní hlavičkou.
 *
 * Text je zásadně bílý (`text-on-contrast`, `text-white/65`), ne lime —
 * lime na tmavé ploše slouží jako akcent (tečka, eyebrow, poslední jednotka
 * odpočtu), na souvislý text má příliš nízký kontrast.
 */
export function NextMatchPanel({
  kicker,
  title,
  subtitle,
  kickoffISO,
  meta,
  actions,
  layout = 'stack',
  radius = 'card',
}: {
  /** Uppercase label u lime tečky — „Nejbližší zápas · Doma". */
  kicker: React.ReactNode
  /** Název zápasu, tedy „HC Čestice — …". */
  title: React.ReactNode
  /** Kolo, místo — ztišený řádek pod nadpisem. */
  subtitle?: React.ReactNode
  /** ISO 8601 úvodního buly pro odpočet. */
  kickoffISO: string
  /** Doplněk levého sloupce (velké datum a čas). */
  meta?: React.ReactNode
  /** CTA pod odpočtem. */
  actions?: React.ReactNode
  layout?: 'stack' | 'wide'
  radius?: 'card' | 'section'
}) {
  const wide = layout === 'wide'

  return (
    /* p-6 na mobilu: 32px odsazení sebralo z 320px šířky pětinu a
       countdown se do zbytku nevešel. */
    <div
      className={cn(
        'bg-contrast relative overflow-hidden p-6 text-on-contrast md:p-8 lg:p-12',
        radius === 'card' ? 'rounded-card' : 'rounded-section',
      )}
    >
      <div className="hatch absolute inset-0 opacity-40" />
      <div
        className={cn(
          'relative',
          wide && 'gap-x-10 gap-y-7 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
        )}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-lime shadow-ring-lime size-2 rounded-full" />
            <Eyebrow tone="lime">{kicker}</Eyebrow>
          </div>
          <CardTitle as="h3" className="mt-2 leading-tight text-white" size="lg">
            {title}
          </CardTitle>
          {subtitle && <div className="text-meta text-white/65">{subtitle}</div>}
          {meta}
        </div>

        {/* `items-end` až od `lg`: pod ním je sloupec pod textem a odpočet
            zarovnaný doprava by se od nadpisu odtrhl. */}
        <div className={cn(wide && 'mt-7 flex flex-col lg:mt-0 lg:items-end')}>
          <Countdown targetISO={kickoffISO} />
          {actions}
        </div>
      </div>
    </div>
  )
}
