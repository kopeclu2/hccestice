import type { PersonCardBlock } from '@/payload-types'

import { Mail, Phone } from 'lucide-react'
import React from 'react'

import type { PersonCard } from '../../types'

import { CardTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { PhotoTile } from '../../components/PhotoTile'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId, toPersonCard } from '../../data/format'
import { fetchPerson } from '../../data/site'

/** Kontaktní karta osoby — portrét, role, telefon a e-mail. */
export async function PersonCardBlockComponent({ block }: { block: PersonCardBlock }) {
  const personId = relId(block.person)
  if (!personId) return null
  const person = await fetchPerson(personId)
  if (!person) return null
  const card = toPersonCard(person)
  if (!card) return null
  return <PersonCardView person={card} />
}

function PersonCardView({ person }: { person: PersonCard }) {
  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto flex max-w-140 items-center gap-5 rounded-card bg-surface p-4.5 md:p-7">
          <PhotoTile
            className="aspect-square w-28 flex-none rounded-panel md:w-36"
            photo={person.photo}
            sizes="9rem"
          />
          <div className="min-w-0">
            <Eyebrow tone="club">{person.role}</Eyebrow>
            <CardTitle as="h3" className="mt-0.5" size="sm">
              {person.name}
            </CardTitle>
            {person.note && <p className="text-dim mt-1 text-meta">{person.note}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {person.phone && (
                <PillLink
                  href={`tel:${person.phone.replace(/\s/g, '')}`}
                  size="xs"
                  variant="outline"
                >
                  <Phone /> {person.phone}
                </PillLink>
              )}
              {person.mail && (
                <PillLink href={`mailto:${person.mail}`} size="xs" variant="club">
                  <Mail /> {person.mail}
                </PillLink>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
