import { Mail, Phone } from 'lucide-react'
import React from 'react'

import type { PersonCard } from '@/landing/types'
import { CardTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import { telHref } from '@/lib/phone'

/**
 * „Nebo pište/volejte přímo" — kontaktní osoby s fotkou, telefonem
 * a e-mailem pod vizitkou a formulářem na `/kontakt`.
 *
 * Samostatné karty vedle sebe (`auto-fit`), ne řádky v jedné velké kartě —
 * sloupec stránky je omezený na `max-w-170` (`ContactPanel`), takže se
 * vejdou dvě karty vedle sebe i tak.
 *
 * Zobrazí se každý člověk z kolekce `people`, i bez telefonu a e-mailu:
 * trenér, který ještě nemá veřejný kontakt, má na stránce být (jméno, role,
 * fotka) a kontakt se doplní v adminu. Dřív se karta filtrovala na
 * `phone || mail` — osoba, jejíž telefon se vymazal (prázdná předvolba
 * „+420"), tak ze stránky tiše zmizela. Bez jediného člověka se nevykreslí
 * nic (ani nadpis).
 */
export function ContactPeopleCard({ people }: { people: PersonCard[] }) {
  if (people.length === 0) return null

  return (
    <div>
      <CardTitle as="h2" className="mb-4" size="xs">
        Napiš nebo zavolej přímo
      </CardTitle>

      {/* `18rem` drží nejvýš dva sloupce v šířce `max-w-170` (`ContactPanel`) —
          při užším minimu se vešly tři a role i dlouhé e-maily se lámaly
          na tři řádky. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] gap-4">
        {people.map((person, index) => (
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
        <CardTitle as="h3" className="mt-0.5" size="xs">
          {person.name}
        </CardTitle>
        {/* Bez pilulek: dlouhé e-maily (`michal.javurek@centrum.cz`) přesahovaly
            přes obrys pill štítku, který na ně nebyl navržený. Prostý text
            s ikonou se místo toho zalomí (`break-all`), ne přeteče. */}
        {(person.phone || person.mail) && (
          <div className="mt-2 flex flex-col gap-1 max-md:-my-1">
            {person.phone && (
              <a
                className="flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-club max-md:py-3.5"
                href={telHref(person.phone)}
              >
                <Phone className="size-3.5 flex-none" /> {person.phone}
              </a>
            )}
            {person.mail && (
              <a
                className="flex items-center gap-1.5 text-xs font-medium break-all text-ink-soft transition-colors hover:text-club max-md:py-3.5"
                href={`mailto:${person.mail}`}
              >
                <Mail className="size-3.5 flex-none" /> {person.mail}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
