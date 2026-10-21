import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { SiteLinks } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { GlowCircle } from '@/landing/ui/Decorations'
import { Eyebrow } from '@/landing/ui/Kicker'
import { ARENA_HOME_TEXT, CLUB_SEAT_TEXT } from '@/lib/club'

/**
 * Levý panel stránky `/kontakt`: rychlé údaje vedle tmavé karty s formulářem
 * (`ContactPanel`). Záměrně jiná kompozice než homepage sekce
 * (`blocks/Contact`) — tam je jedna vystředěná karta s obřím nadpisem přes
 * celou šířku, tady jde o užší „vizitku" v levém sloupci, aby stránka
 * nebyla jen zvětšená kopie stejné karty.
 */
export function ContactInfoPanel({ site }: { site: SiteLinks }) {
  return (
    /* Bez `rounded-card bg-surface p-*` — vizitka dřív byla vlastní bílá
       karta s paddingem, takže její obsah (`Přímý kontakt`, e-mail) začínal
       o `p-9` (36px na `lg`) víc doprava než nadpis „Nebo pište..." hned
       pod ní, který žádnou kartu nemá. Bez rámečku sedí oba na stejné hraně
       stránky, jako běžný obsahový blok, ne jako karta v kartě.
       `z-0`: `-z-1` uvnitř `GlowCircle` by jinak „propadlo" za jakýkoli
       pozdější sourozenec s neprůhledným pozadím ve stacking contextu
       nadřazeného `SectionShellu` (ten má `z-1`). */
    <div className="relative z-0 pb-6 md:pb-7 lg:pb-9">
      <GlowCircle className="-top-20 -right-10 size-70" tone="lime" />

      {/* `block`: `Eyebrow` je inline `<span>`, takže bez něj seděl label na
          stejném řádku vedle e-mailového odkazu (ten je taky inline-level),
          místo aby se zalomil nad něj — `mt-3` na odkazu pak jen posunulo
          celý řádek, ne odkaz pod label. */}
      <Eyebrow className="block" tone="club">
        Přímý kontakt
      </Eyebrow>

      <a
        /* Stejné dvě úpravy pro 320px jako u homepage varianty: spodní
           hranice clampu 20px a `break-words` místo `overflow-wrap:anywhere`
           (to by shrink-to-fit `inline-flex` zkrátilo o znak a adresa by se
           lámala i tam, kde se vejde). */
        className="relative mt-3 inline-flex items-center gap-2.5 text-contact-md font-extrabold tracking-heading break-words text-ink transition-colors hover:text-club max-md:py-2"
        href={`mailto:${site.email}`}
      >
        {site.email}
        <span className="grid size-[0.9em] flex-none place-items-center rounded-full bg-lime text-ink [&_svg]:size-[0.5em]">
          <ArrowUpRight strokeWidth={2.5} />
        </span>
      </a>

      <p className="mt-4 text-sm leading-relaxed text-pretty text-dim">
        Obvykle odpovídáme do pár dní. Když to spěchá, zavolej přímo někomu z realizačního týmu.
      </p>

      {/* Sídlo a stadion zvlášť, v pilulkách jako dřív (a jako sociální sítě pod
          nimi). Text z `lib/club` — táž data jako JSON-LD. Dlouhé řetězce se na
          úzkém displeji zalamují (`whitespace-normal`), jinak by pilulka přetekla. */}
      <address className="mt-7 flex flex-wrap gap-2 not-italic">
        {[CLUB_SEAT_TEXT, ARENA_HOME_TEXT].map((line) => (
          <Badge
            className="text-left text-xs leading-snug font-medium whitespace-normal sm:text-sm"
            key={line}
            size="lg"
            variant="outline"
          >
            {line}
          </Badge>
        ))}
      </address>

      {(site.facebook || site.instagram) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {site.facebook && <SocialPill href={site.facebook} label="Facebook" />}
          {site.instagram && <SocialPill href={site.instagram} label="Instagram" />}
        </div>
      )}
    </div>
  )
}

function SocialPill({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild size="sm" variant="outline" withArrow>
      <Link href={href} rel="noreferrer" target="_blank">
        {label}
      </Link>
    </Button>
  )
}
