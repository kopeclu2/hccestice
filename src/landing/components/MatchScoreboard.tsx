import Image from 'next/image'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

import type { ArticleScoreboard, Photo } from '../types'

import { Badge } from './Badge'
import { Numeral } from './Numeral'

/**
 * Tabule se skóre, týmy a třetinami na tmavé ploše — sdílí ji hero
 * reportáže (`article/hero/HeroMatch`) a hlavička detailu zápasu
 * (`zapas/MatchHeader`). Obsah stojí v rodiči (tmavý panel), tahle
 * komponenta vrací jen dva sourozence: řádek tým · skóre · tým a pod ním
 * třetiny — proto fragment, ne vlastní obal. Rodič tak drží svůj rytmus
 * odsazení a hero zůstává pixel po pixelu stejné.
 *
 * Skóre i třetiny jsou v pořadí domácí : hosté; zvýrazněný (lime) je
 * vítězný tým, takže stačí `weWon` a `weAreHome`.
 *
 * `logos` jsou volitelné a bez nich se nevykreslí nic navíc — hero
 * reportáže logo nikdy nemělo.
 */
export function MatchScoreboard({
  scoreboard,
  logos,
}: {
  scoreboard: Pick<
    ArticleScoreboard,
    'homeName' | 'awayName' | 'homeScore' | 'awayScore' | 'weAreHome' | 'weWon' | 'thirds' | 'suffix'
  >
  logos?: { home: Photo | null; away: Photo | null }
}) {
  return (
    <>
      <div className="my-[clamp(1.75rem,3vw,2.75rem)] flex flex-wrap items-center justify-center gap-[clamp(1.25rem,4vw,3.5rem)] text-center">
        <div className="min-w-30 flex-1 text-right">
          {logos && <TeamLogo className="ml-auto" logo={logos.home} />}
          <div className="text-[clamp(1.125rem,2vw,1.875rem)] font-extrabold tracking-[-0.02em]">
            {scoreboard.homeName}
          </div>
          <div className="mt-1 text-caption font-semibold text-white/55">Domácí</div>
        </div>

        <Numeral
          as="div"
          className="max-md:text-numeral-2xl flex flex-none items-baseline gap-3.5"
          size="score"
        >
          <span className={cn(scoreboard.weWon && scoreboard.weAreHome && 'text-lime')}>
            {scoreboard.homeScore}
          </span>
          {/* Dvě tečky, ne text „:" — Archivo kreslí dvojtečku jako dva
              hranaté body, které v drobném řezu na tmavém pozadí čtou
              jako náhodné čtverečky, ne jako oddělovač skóre. */}
          <span className="flex flex-col items-center gap-2.5 self-center">
            <span className="bg-white/30 size-2 rounded-full" />
            <span className="bg-white/30 size-2 rounded-full" />
          </span>
          <span className={cn(scoreboard.weWon && !scoreboard.weAreHome && 'text-lime')}>
            {scoreboard.awayScore}
          </span>
          {scoreboard.suffix && (
            <span className="self-start text-[.3em] font-bold text-white/60">
              {scoreboard.suffix}
            </span>
          )}
        </Numeral>

        <div className="min-w-30 flex-1 text-left">
          {logos && <TeamLogo logo={logos.away} />}
          <div className="text-[clamp(1.125rem,2vw,1.875rem)] font-extrabold tracking-[-0.02em]">
            {scoreboard.awayName}
          </div>
          <div className="mt-1 text-caption font-semibold text-white/55">Hosté</div>
        </div>
      </div>

      {scoreboard.thirds.length > 0 && (
        <div className="flex justify-center gap-2">
          {scoreboard.thirds.map((third, index) => {
            // zvýrazněná je závěrečná třetina vítězného zápasu
            const winning = scoreboard.weWon && index === scoreboard.thirds.length - 1
            return (
              <Badge
                className={cn('text-white/70', winning && 'border-lime/40 bg-lime/12 text-lime')}
                key={index}
                size="sm"
                variant="glassOutline"
              >
                {third}
              </Badge>
            )
          })}
        </div>
      )}
    </>
  )
}

/**
 * Logo týmu nad názvem. Dekorativní (`alt=""`): jméno týmu stojí hned pod
 * ním jako text, čtečka by ho jinak četla dvakrát. Bez loga se nekreslí
 * nic — zápasy se soupeřem bez nahraného znaku nesmí mít prázdnou díru.
 */
function TeamLogo({ className, logo }: { className?: string; logo: Photo | null }) {
  if (!logo) return null
  return (
    <Image
      alt=""
      className={cn('mb-2.5 size-12 rounded-full bg-white/90 object-contain p-1 md:size-16', className)}
      height={64}
      src={getMediaUrl(logo.url, logo.updatedAt)}
      width={64}
    />
  )
}
