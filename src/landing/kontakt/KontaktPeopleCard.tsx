import { Mail, Phone } from 'lucide-react'
import React from 'react'

import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { PhotoTile } from '@/landing/ui/PhotoTile'

import type { PersonCard } from '../types'

/**
 * „Nebo pište/volejte přímo" — kontaktní osoby s fotkou, telefonem
 * a e-mailem pod vizitkou a formulářem na `/kontakt`.
 *
 * Samostatné karty vedle sebe (`auto-fit`), ne řádky v jedné velké kartě —
 * sloupec stránky je omezený na `max-w-170` (`KontaktPanel`), takže se
 * vejdou dvě karty vedle sebe i tak.
 *
 * Renderuje se, jen když aspoň jeden člověk z kolekce `people` má
 * vyplněný telefon nebo e-mail — bez toho by karta byla jen jméno,
 * role a fotka bez jakékoli kontaktní hodnoty.
 */
export function KontaktPeopleCard({ people }: { people: PersonCard[] }) {
  const contacts = people.filter((person) => person.phone || person.mail)
  if (contacts.length === 0) return null

  return (
    <div>
      <CardTitle as="h3" className="mb-4" size="xs">
        Nebo pište či volejte přímo
      </CardTitle>

      {/* `18rem` drží nejvýš dva sloupce v šířce `max-w-170` (`KontaktPanel`) —
          při užším minimu se vešly tři a role i dlouhé e-maily se lámaly
          na tři řádky. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] gap-4">
        {contacts.map((person, index) => (
          <PersonContactTile key={`${index}-${person.name}`} person={person} />
        ))}
      </div>
    </div>
  )
}

function PersonContactTile({ person }: { person: PersonCard }) {
  return (
    <div className="flex items-center gap-3.5 rounded-card border border-line-soft bg-surface p-4.5 md:p-5">
      <PhotoTile
        className="aspect-square w-14 flex-none rounded-panel md:w-16"
        photo={person.photo}
        sizes="4rem"
      />
      <div className="min-w-0">
        <Eyebrow tone="club">{person.role}</Eyebrow>
        <CardTitle as="h4" className="mt-0.5" size="xs">
          {person.name}
        </CardTitle>
        {/* Bez pilulek: dlouhé e-maily (`michal.javurek@centrum.cz`) přesahovaly
            přes obrys pill štítku, který na ně nebyl navržený. Prostý text
            s ikonou se místo toho zalomí (`break-all`), ne přeteče. */}
        <div className="mt-2 flex flex-col gap-1">
          {person.phone && (
            <a
              className="flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-club"
              href={`tel:${person.phone.replace(/\s/g, '')}`}
            >
              <Phone className="size-3.5 flex-none" /> {person.phone}
            </a>
          )}
          {person.mail && (
            <a
              className="flex items-center gap-1.5 text-xs font-medium break-all text-ink-soft transition-colors hover:text-club"
              href={`mailto:${person.mail}`}
            >
              <Mail className="size-3.5 flex-none" /> {person.mail}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
