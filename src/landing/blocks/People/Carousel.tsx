'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import type { PersonCard } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow, Highlight, Kicker } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { Watermark } from '@/landing/ui/Watermark'
import { CLUB_LOGO } from '@/lib/club'
import { getMediaUrl } from '@/lib/getMediaUrl'

/**
 * Lidé v klubu — horizontální carousel karet se šipkami ← →.
 *
 * Karta: světlý podklad s lime „září" a šrafováním, portrét,
 * glass jmenovka se jménem, rolí a odkazem na kontakt (mail/telefon).
 * Osoby se spravují v kolekci „Lidé v klubu", výběr v bloku.
 */
export function PeopleCarousel({ people, intro }: { people: PersonCard[]; intro: string }) {
  const carouselRef = React.useRef<HTMLDivElement>(null)

  if (people.length === 0) return null

  const scrollByCard = (direction: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: direction * 20.5 * 16, behavior: 'smooth' })
  }

  return (
    <SectionShell id="lide">
      <Watermark
        className="-top-8 -right-13 text-watermark-md tracking-[-0.05em] text-ink/4"
        outlined={false}
      >
        ŠATNA
      </Watermark>

      <div className="mb-10 flex flex-wrap items-end gap-4">
        <div>
          <Kicker>Lidé v klubu</Kicker>
          <SectionTitle className="mt-3.5">
            Kdo to celé <Highlight>drží pohromadě</Highlight>
          </SectionTitle>
        </div>
        <div className="flex-1" />
        <p className="hidden max-w-75 text-right text-sm leading-normal text-faint lg:block">
          {intro}
        </p>
        <div className="flex gap-2">
          <button
            aria-label="Předchozí"
            className="grid size-10.5 place-items-center rounded-full border border-line bg-surface transition-colors hover:bg-contrast hover:text-on-contrast [&_svg]:size-4"
            onClick={() => scrollByCard(-1)}
            type="button"
          >
            <ArrowLeft />
          </button>
          <button
            aria-label="Další"
            className="grid size-10.5 place-items-center rounded-full bg-contrast text-on-contrast transition-colors hover:bg-club [&_svg]:size-4"
            onClick={() => scrollByCard(1)}
            type="button"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      <div
        className="-mx-4.5 no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4.5 pb-4.5 md:mx-0 md:gap-7 md:px-1"
        ref={carouselRef}
      >
        {people.map((person) => (
          <PersonTile key={person.name} person={person} />
        ))}
      </div>
    </SectionShell>
  )
}

function PersonTile({ person }: { person: PersonCard }) {
  const contactHref = person.mail
    ? `mailto:${person.mail}`
    : person.phone
      ? `tel:${person.phone.replace(/\s/g, '')}`
      : undefined

  return (
    <article className="flex-[0_0_70%] snap-start sm:flex-[0_0_44%] md:flex-[0_0_18.75rem]">
      <div className="relative aspect-[1/1.2] overflow-hidden rounded-panel border border-paper-deep bg-surface">
        {/* lime záře + šrafování na pozadí karty */}
        <div className="absolute -bottom-2/5 left-1/2 aspect-square w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-lime)/55%),--alpha(var(--color-lime)/6%)_68%)]" />
        <div className="absolute inset-0 hatch opacity-60" />
        <Image
          alt=""
          aria-hidden
          className="absolute top-4 left-4.5 size-18.5 opacity-18 grayscale"
          height={74}
          src={CLUB_LOGO}
          width={74}
        />
        <div className="absolute top-4.5 right-4.5 text-eyebrow font-bold tracking-[0.26em] text-club/35 uppercase [writing-mode:vertical-rl]">
          {person.role}
        </div>

        {person.photo && (
          <Image
            alt={`${person.name} — ${person.role}`}
            className="absolute inset-0 size-full object-cover object-top"
            height={person.photo.height}
            src={getMediaUrl(person.photo.url, person.photo.updatedAt)}
            width={person.photo.width}
          />
        )}

        {/* glass jmenovka */}
        <a
          className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-3 rounded-badge bg-white/94 px-4.5 py-3.25 shadow-float backdrop-blur-md"
          href={contactHref}
          title={person.mail ?? person.phone ?? undefined}
        >
          <span>
            <span className="block text-sm font-bold tracking-tight md:text-base">
              {person.name}
            </span>
            <Eyebrow className="mt-0.25 block">{person.role}</Eyebrow>
          </span>
          <span className="grid size-8 flex-none place-items-center rounded-full bg-lime text-ink [&_svg]:size-3.5">
            <ArrowUpRight strokeWidth={2.5} />
          </span>
        </a>
      </div>
    </article>
  )
}
