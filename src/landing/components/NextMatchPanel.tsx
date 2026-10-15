import React from 'react'

import { DotEyebrow } from '@/landing/ui/DotEyebrow'
import { CardTitle } from '@/landing/ui/Heading'
import { StretchedLink, stretchHost } from '@/landing/ui/StretchedLink'
import { cn } from '@/lib/utils'

import { Countdown } from '../blocks/Hero/Countdown'

import { MatchMeta } from './MatchMeta'
import { splitMatchTitle, TeamPair } from './TeamPair'

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
  titleAs = 'h3',
  href,
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
  /** `h1` na stránce, kde je panel celou hlavičkou (detail zápasu); jinde `h3`. */
  titleAs?: 'h1' | 'h3'
  /**
   * Detail zápasu. Titulek se stane odkazem přes celý panel (stretched link),
   * takže `actions` s vlastními odkazy dostanou `z-1`. Chybí-li, panel není klikací.
   */
  href?: string | null
}) {
  const wide = layout === 'wide'

  return (
    /* p-4.5 na mobilu (tři stupně odsazení jako ostatní panely, viz
       AGENTS.md → Responzivita): s 24–32 px se na 320px displeji odpočet
       nevešel a „sek" padala na vlastní řádek. */
    <div
      className={cn(
        'relative overflow-hidden bg-contrast p-4.5 text-on-contrast md:p-8 lg:p-12',
        href && stretchHost,
        radius === 'card' ? 'rounded-card' : 'rounded-section',
      )}
    >
      <div className="absolute inset-0 hatch opacity-40" />
      <div
        className={cn(
          'relative',
          wide && 'gap-x-10 gap-y-7 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
        )}
      >
        <div>
          <DotEyebrow>{kicker}</DotEyebrow>
          <CardTitle as={titleAs} className="mt-2 leading-tight text-white" size="lg">
            {/* `-inset-*` = odsazení panelu, aby klikací byl i jeho okraj. */}
            <StretchedLink
              className="decoration-lime underline-offset-6 after:-inset-4.5 hover:underline md:after:-inset-8 lg:after:-inset-12"
              href={href ?? null}
            >
              <PanelTitle title={title} />
            </StretchedLink>
          </CardTitle>
          {/* Řetězec „VČHL 2. ročník · Základní část · Žamberk" se láme mezi
              údaji, ne uvnitř nich a bez visící tečky (`MatchMeta`). */}
          {typeof subtitle === 'string' ? (
            <MatchMeta
              className="mt-1.5 text-sm font-normal text-white/65"
              items={subtitle.split(' · ')}
            />
          ) : (
            subtitle && <div className="mt-1.5 text-sm text-white/65">{subtitle}</div>
          )}
          {meta}
        </div>

        {/* `items-end` až od `lg`: pod ním je sloupec pod textem a odpočet
            zarovnaný doprava by se od nadpisu odtrhl. */}
        <div className={cn(wide && 'mt-7 flex flex-col lg:mt-0 lg:items-end')}>
          <Countdown targetISO={kickoffISO} />
          {actions && (href ? <div className="relative z-1">{actions}</div> : actions)}
        </div>
      </div>
    </div>
  )
}

/**
 * Titulek „domácí × hosté" se láme za „×", ne uvnitř názvu týmu — na 320 px
 * jinak vznikalo „HC Čestice × HC / Skuteč". Titulek, který dvojici týmů
 * nenese (vlastní text volajícího), projde beze změny.
 */
function PanelTitle({ title }: { title: React.ReactNode }) {
  const teams = typeof title === 'string' ? splitMatchTitle(title) : null
  return teams ? <TeamPair away={teams.away} home={teams.home} /> : <>{title}</>
}
