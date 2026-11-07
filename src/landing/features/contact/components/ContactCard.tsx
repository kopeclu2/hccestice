import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { ContactContent } from '@/landing/features/contact/types'
import type { PersonCard, SiteLinks } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { telHref } from '@/lib/phone'
import { cn } from '@/lib/utils'

import { ContactFormLazy } from './ContactFormLazy'

/**
 * Kontaktní karta (sdílená): bílá karta s velkým e-mailem, pill údaji a odkazy na sítě,
 * uvnitř tmavá karta s formulářem.
 */
export function ContactCard({
  content,
  site,
  formTone = 'dark',
  intro = true,
  framed = true,
  youthContacts = [],
}: {
  content: ContactContent
  site: SiteLinks
  /** `dark` na homepage, `light` na `/kontakt` (bílý formulář s obrysem). */
  formTone?: 'dark' | 'light'
  /** Štítek, nadpis „Pojďme na led“, perex; `/kontakt` je nechce. */
  intro?: boolean
  /** Bílá zaoblená karta kolem obsahu; bez ní stojí obsah rovnou na pozadí stránky. */
  framed?: boolean
  /** Osoby pro dotazy rodičů dětí (`pickYouthContacts`); prázdné = blok se nevykreslí. */
  youthContacts?: PersonCard[]
}) {
  return (
    <>
      <Reveal>
        <div
          className={cn(
            'relative text-center',
            framed
              ? 'overflow-hidden rounded-card bg-surface px-4.5 py-10 md:px-8 md:pt-12 md:pb-11 lg:px-13 lg:pt-16 lg:pb-13'
              : 'py-4 md:py-6',
          )}
        >
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

          {/* Formulář je jediné primární kontaktní místo. E-mail zůstává jako
              textový odkaz (ne obří display s lime kruhem), aby s formulářem
              nesoutěžil. `break-words`, ne `overflow-wrap:anywhere`: to by
              snížilo max-content a adresa by se lámala i tam, kde se vejde. */}
          <p className="relative text-sm text-dim md:text-base">
            Nebo napiš rovnou na{' '}
            <a
              className="inline-block font-bold break-words text-ink underline decoration-lime decoration-2 underline-offset-4 transition-colors hover:text-club max-md:py-3"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>

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
          <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-5">
            {content.pills.length > 0 && (
              <p className="w-full text-sm font-medium text-dim md:w-auto">
                {content.pills.join(' · ')}
              </p>
            )}
            {site.facebook && <SocialLink href={site.facebook} label="Facebook" />}
            {site.instagram && <SocialLink href={site.instagram} label="Instagram" />}
          </div>

          {youthContacts.length > 0 && <YouthContacts people={youthContacts} />}

          <ContactFormLazy tone={formTone} topics={content.topics} />
        </div>
      </Reveal>
    </>
  )
}

/** Odkaz na sociální síť — textový, s šipkou; tap target 44 px na mobilu. */
function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex items-center gap-1 text-sm font-bold text-ink-soft underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-club hover:decoration-lime max-md:py-3"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
    </Link>
  )
}

/**
 * Kontakt pro mládež (rodiče dětí): jméno, role a telefon / e-mail osob, které
 * správce v kolekci `people` označí rolí s „mládež“. Bez takové osoby se
 * nevykreslí nic — žádný vymyšlený kontakt.
 */
function YouthContacts({ people }: { people: PersonCard[] }) {
  return (
    <div className="relative mt-5 text-sm text-dim">
      <p className="font-bold text-ink">Máš dítě a chceš na led? Ozvi se přímo:</p>
      <ul className="mt-1 flex flex-col items-center gap-x-6 gap-y-0 md:flex-row md:flex-wrap md:justify-center">
        {people.map((person, index) => (
          <li
            className="flex flex-wrap items-center justify-center gap-x-3"
            key={`${index}-${person.name}`}
          >
            <span className="font-medium">
              {person.name} <span className="text-faint">({person.role})</span>
            </span>
            {person.phone && (
              <a
                className="underline underline-offset-4 hover:text-club max-md:py-3"
                href={telHref(person.phone)}
              >
                {person.phone}
              </a>
            )}
            {person.mail && (
              <a
                className="break-all underline underline-offset-4 hover:text-club max-md:py-3"
                href={`mailto:${person.mail}`}
              >
                {person.mail}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
