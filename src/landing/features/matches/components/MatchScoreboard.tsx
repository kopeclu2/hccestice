import React from 'react'

import type { ArticleScoreboard } from '@/landing/features/matches/types'
import { formatPair } from '@/landing/features/matches/view/matchFormat'
import type { Photo } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { Numeral } from '@/landing/ui/Numeral'
import { cn } from '@/lib/utils'

import { TeamCrest } from './TeamCrest'

/**
 * Tabule se skóre, týmy a třetinami na tmavé ploše — sdílí ji hero
 * reportáže (`features/posts/components/hero/HeroMatch`) a hlavička detailu zápasu
 * (`MatchHeader`). Obsah stojí v rodiči (tmavý panel), tahle
 * komponenta vrací jen dva sourozence: řádek tým · skóre · tým a pod ním
 * třetiny — proto fragment, ne vlastní obal. Rodič tak drží svůj rytmus
 * odsazení. Rozvržení je pro obě místa stejné — oprava zalamování dlouhých
 * jmen týmů platí i pro hero reportáže.
 *
 * Skóre i třetiny jsou v pořadí domácí : hosté; zvýrazněný (lime) je
 * vítězný tým, takže stačí `weWon` a `weAreHome`.
 *
 * `logos` jsou volitelné a bez nich se nevykreslí nic navíc — hero
 * reportáže logo nikdy nemělo. Když loga přijdou, ale jedno chybí
 * (soupeř bez znaku), nahradí ho monogram, aby tabule zůstala souměrná.
 */
export function MatchScoreboard({
  scoreboard,
  logos,
}: {
  scoreboard: Pick<
    ArticleScoreboard,
    | 'homeName'
    | 'awayName'
    | 'homeScore'
    | 'awayScore'
    | 'weAreHome'
    | 'weWon'
    | 'thirds'
    | 'suffix'
  >
  logos?: { home: Photo | null; away: Photo | null }
}) {
  const hasLogos = Boolean(logos && (logos.home || logos.away))

  return (
    <>
      {/* Mřížka 1fr | skóre | 1fr drží skóre přesně uprostřed, ať je jméno
          domácích jakkoli dlouhé — dřív se v `flex-wrap` řádku na mobilu
          domácí zarovnali doprava nad skóre a hosté doleva pod něj.

          Pod `md` je to trojice jako v aplikacích: logo | skóre | logo
          v prvním řádku, jména (na střed, smí se zalomit) ve druhém, takže
          dvouřádkové „HC Aloha Lanškroun" neposune loga ani skóre. Týmové
          obaly jsou tam `contents`, aby jejich děti mohly sedět v řádcích
          mřížky. Bez log (hero reportáže) zůstane v prvním řádku jen skóre —
          jména vedle něj se na 320 px tlačila do „sn“. Od
          `md` je tým zase jeden sloupec: logo nad jménem, domácí zarovnaní
          ke skóre zprava, hosté zleva. */}
      <div className="my-[clamp(1.75rem,3vw,2.75rem)] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 3xs:gap-x-4 md:gap-x-[clamp(1.25rem,4vw,3.5rem)]">
        <Team
          hasLogos={hasLogos}
          label="Domácí"
          logo={logos?.home ?? null}
          name={scoreboard.homeName}
          side="home"
        />

        <Numeral
          as="div"
          className="relative col-start-2 row-start-1 flex items-baseline gap-2.5 max-md:text-score-board md:gap-3.5"
          size="score"
        >
          <span className={cn(scoreboard.weWon && scoreboard.weAreHome && 'text-lime')}>
            {scoreboard.homeScore}
          </span>
          {/* Dvě tečky, ne text „:" — Archivo kreslí dvojtečku jako dva
              hranaté body, které v drobném řezu na tmavém pozadí čtou
              jako náhodné čtverečky, ne jako oddělovač skóre. */}
          <span className="flex flex-col items-center gap-1.5 self-center md:gap-2.5">
            <span className="size-1.5 rounded-full bg-on-contrast-line md:size-2" />
            <span className="size-1.5 rounded-full bg-on-contrast-line md:size-2" />
          </span>
          <span className={cn(scoreboard.weWon && !scoreboard.weAreHome && 'text-lime')}>
            {scoreboard.awayScore}
          </span>
          {/* Mimo tok (`absolute`), aby „sn" neposouvalo číslice ze středu. */}
          {scoreboard.suffix && (
            <span className="absolute top-0 left-full ml-1 text-[.3em] font-bold text-on-contrast-subtle md:ml-1.5">
              {scoreboard.suffix}
            </span>
          )}
        </Numeral>

        <Team
          hasLogos={hasLogos}
          label="Hosté"
          logo={logos?.away ?? null}
          name={scoreboard.awayName}
          side="away"
        />
      </div>

      {scoreboard.thirds.length > 0 && (
        <div className="flex justify-center gap-2">
          {scoreboard.thirds.map((third, index) => {
            // zvýrazněná je závěrečná třetina vítězného zápasu
            const winning = scoreboard.weWon && index === scoreboard.thirds.length - 1
            return (
              <Badge
                className={cn(
                  'text-on-contrast-muted',
                  winning && 'border-lime/40 bg-lime/12 text-lime',
                )}
                key={index}
                size="sm"
                variant="glassOutline"
              >
                {formatPair(third)}
              </Badge>
            )
          })}
        </div>
      )}
    </>
  )
}

/**
 * Jeden tým tabule: logo, jméno a popisek strany. Na mobilu `contents`
 * (viz komentář u mřížky), od `md` sloupec zarovnaný ke skóre.
 */
function Team({
  side,
  name,
  label,
  logo,
  hasLogos,
}: {
  side: 'home' | 'away'
  name: string
  label: string
  logo: Photo | null
  hasLogos: boolean
}) {
  const home = side === 'home'
  const column = home ? 'col-start-1' : 'col-start-3'

  return (
    <div
      className={cn(
        'row-start-1 max-md:contents md:flex md:min-w-0 md:flex-col',
        column,
        home ? 'md:items-end' : 'md:items-start',
      )}
    >
      {hasLogos && (
        <div className={cn('row-start-1 flex justify-center md:mb-3 md:block', column)}>
          {/* Dekorace: jméno týmu stojí hned pod znakem jako text. Soupeř bez
              nahraného znaku dostane kroužek s monogramem — bez něj by na jedné
              straně tabule chybělo logo a jména by nelícovala. */}
          <TeamCrest
            className="size-12 text-lg md:size-16 md:text-2xl"
            logo={logo}
            name={name}
            pixels={64}
            tone="board"
          />
        </div>
      )}
      <div
        className={cn(
          'min-w-0 text-center',
          home ? 'md:text-right' : 'md:text-left',
          column,
          'row-start-2 max-md:self-start',
        )}
      >
        {/* `break-words`: jediné slovo širší než sloupec (320 px) se radši
            zlomí, než aby přeteklo pod skóre. */}
        <div className="text-sm leading-tight font-extrabold tracking-subheading text-balance break-words 3xs:text-base md:text-xl lg:text-2xl">
          {name}
        </div>
        <div className="mt-1 text-xs font-medium text-on-contrast-subtle">{label}</div>
      </div>
    </div>
  )
}
