import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { ContactContent } from '@/landing/features/contact/types'
import type { SiteLinks } from '@/landing/types'
import { Badge } from '@/landing/ui/Badge'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { Watermark } from '@/landing/ui/Watermark'
import { cn } from '@/lib/utils'

import { ContactFormLazy } from './ContactFormLazy'

/**
 * Kontaktní karta (sdílená): bílá karta s velkým e-mailem, pill údaji a odkazy na sítě,
 * uvnitř tmavá karta s formulářem. Dekorace: šrafování nahoře, rozmazané
 * barevné kruhy, svislé nápisy po stranách, watermark „ZIMÁK".
 */
export function ContactCard({
  content,
  site,
  formTone = 'dark',
  intro = true,
  decor = true,
  framed = true,
}: {
  content: ContactContent
  site: SiteLinks
  /** `dark` na homepage, `light` na `/kontakt` (bílý formulář s obrysem). */
  formTone?: 'dark' | 'light'
  /** Štítek, nadpis „Pojďme na led“, perex a svislý nápis; `/kontakt` je nechce. */
  intro?: boolean
  /** Záře, kruh s tečkou, svislý nápis „HC ČESTICE · VČHL“ a watermark „ZIMÁK“. */
  decor?: boolean
  /** Bílá zaoblená karta kolem obsahu; bez ní stojí obsah rovnou na pozadí stránky. */
  framed?: boolean
}) {
  return (
    <>
      {decor && (
        <Watermark
          className="top-70 -right-10 text-watermark-lg tracking-tighter text-club/6"
          outlined={false}
        >
          ZIMÁK
        </Watermark>
      )}

      <Reveal>
        <div
          className={cn(
            'relative text-center',
            framed
              ? 'overflow-hidden rounded-card bg-surface px-4.5 py-10 md:px-8 md:pt-12 md:pb-11 lg:px-13 lg:pt-16 lg:pb-13'
              : 'py-4 md:py-6',
          )}
        >
          {decor && (
            <>
              {/* dekorace pozadí */}
              <div className="pointer-events-none absolute top-50 -left-22 hidden size-85 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-lime)/45%),transparent_65%)] blur-xl md:block" />
              <div className="pointer-events-none absolute top-85 -right-22 hidden size-85 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-club)/20%),transparent_65%)] blur-xl md:block" />
              {/* Kruhy mají pevné pozice od pravé hrany karty. Na tabletu se karta
                zúží, ale nadpis zůstane vycentrovaný, takže lime tečka nasedla
                přímo na tečku za „led". Dekorace proto naskakují až od `lg`. */}
              <div className="pointer-events-none absolute top-17 right-15 hidden size-37.5 rounded-full border-2 border-club/14 lg:block" />
              <div className="pointer-events-none absolute top-30 right-27 hidden size-13 rounded-full bg-lime opacity-55 lg:block" />
              <div className="pointer-events-none absolute top-37 left-11 hidden origin-top-left -rotate-90 text-sm font-bold tracking-[0.3em] whitespace-nowrap text-club/22 uppercase md:block md:text-base">
                HC ČESTICE · VČHL
              </div>
            </>
          )}
          {intro && (
            <div className="pointer-events-none absolute right-11 bottom-37 hidden origin-bottom-right rotate-90 text-sm font-bold tracking-[0.3em] whitespace-nowrap text-club/22 uppercase md:block md:text-base">
              POJĎME NA LED
            </div>
          )}

          {intro && (
            <>
              <Kicker className="relative">{content.kicker}</Kicker>
              <SectionTitle className="relative mx-auto mt-5 mb-2.5" size="xl">
                Pojďme na <Highlight dot>led</Highlight>
              </SectionTitle>
              <p className="relative mx-auto mb-9 max-w-120 leading-relaxed text-pretty text-dim">
                {content.perex}
              </p>
            </>
          )}

          <a
            /* Dvě změny kvůli 320px: spodní hranice clampu je 20px (při 24px
               se adresa nevešla) a `break-words` místo `overflow-wrap:anywhere`.
               `anywhere` totiž na rozdíl od `break-word` **snižuje max-content**
               boxu, takže shrink-to-fit `inline-flex` vyšel o jeden znak kratší
               a adresa se lámala („hccestice@seznam.c / z") i tam, kde se
               vejde. Záchranná brzda pro dlouhou adresu z CMS zůstává. */
            className="relative inline-flex items-center gap-2.5 text-contact-lg font-extrabold tracking-heading break-words text-ink transition-colors hover:text-club max-md:py-2 md:gap-4.5"
            href={`mailto:${site.email}`}
          >
            {site.email}
            <span className="grid size-[0.9em] flex-none place-items-center rounded-full bg-lime text-ink [&_svg]:size-[0.5em]">
              <ArrowUpRight strokeWidth={2.5} />
            </span>
          </a>

          {/*
           * Adresa a sítě jsou dvě oddělené skupiny (`flex-col` pod `md`),
           * ne jeden společný `flex-wrap` řádek o čtyřech položkách. Ten totiž
           * mezi ~400–540px zalamoval nerovnoměrně (3 pilulky na řádku, 1
           * osamělá vystředěná pod nimi) — `justify-center` centruje každý
           * zalomený řádek zvlášť, takže poslední samotná položka vypadala
           * jako plovoucí chyba, ne jako pokračování seznamu. Rozdělení na
           * dvojice zajistí, že se zalomí nejvýš po párech. Od `md` se obě
           * skupiny slijí do jednoho řádku jako dřív (`md:flex-row`).
           */}
          <div className="relative mt-9 flex flex-col items-center gap-2.5 md:flex-row md:flex-wrap md:justify-center">
            <div className="flex flex-wrap justify-center gap-2.5">
              {content.pills.map((pill) => (
                <Badge className="font-medium" key={pill} size="lg" variant="outline">
                  {pill}
                </Badge>
              ))}
            </div>
            {(site.facebook || site.instagram) && (
              <div className="flex flex-wrap justify-center gap-2.5">
                {site.facebook && <SocialPill href={site.facebook} label="Facebook" />}
                {site.instagram && <SocialPill href={site.instagram} label="Instagram" />}
              </div>
            )}
          </div>

          <ContactFormLazy tone={formTone} topics={content.topics} />
        </div>
      </Reveal>
    </>
  )
}

/**
 * Odkaz na sociální síť ve stejném řádku jako pill údaje (`Badge` s obrysem).
 * Varianta `club` do něj přinesla jinou barvu obrysu, jinou váhu i jinou výšku
 * (h-11/md:h-10 proti 36px štítku), takže je sjednocená na `outline` a od
 * neklikatelných štítků ji odlišuje jen šipka v kruhu (`withArrow`), ne barva.
 */
function SocialPill({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild size="sm" variant="outline" withArrow>
      <Link href={href} rel="noreferrer" target="_blank">
        {label}
      </Link>
    </Button>
  )
}
