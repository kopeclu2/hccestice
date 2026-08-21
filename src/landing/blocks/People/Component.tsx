import type { LandingPeopleBlock } from '@/payload-types'

import React from 'react'

import { toPersonCard } from '../../data/format'
import type { PersonCard } from '../../types'

import { PeopleCarousel } from './Carousel'

/** Block data → intro text + karty osob (nepopulované relace se přeskočí). */
function mapPeople(block: LandingPeopleBlock): { intro: string; cards: PersonCard[] } {
  return {
    intro:
      block.intro ??
      'Všichni to dělají po práci a zadarmo. Když nezvedáme telefon, jsme nejspíš na ledě.',
    cards: (block.people ?? [])
      .map(toPersonCard)
      .filter((card): card is PersonCard => card !== null),
  }
}

/** Lidé v klubu — server komponenta namapuje blok a předá klientskému carouselu. */
export function PeopleBlockComponent({ block }: { block: LandingPeopleBlock }) {
  const { intro, cards } = mapPeople(block)
  return <PeopleCarousel intro={intro} people={cards} />
}
