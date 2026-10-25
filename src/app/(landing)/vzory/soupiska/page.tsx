import type { Metadata } from 'next'
import React from 'react'

import { fetchAllPeople } from '@/landing/data/site'
import { PlayerTile, type RosterCard } from '@/landing/features/roster/components/PlayerTile'
import { PlayerTileJersey } from '@/landing/features/roster/components/PlayerTileJersey'
import { fetchRosterSections, POSITION_LABEL } from '@/landing/features/roster/data'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { PageTitle, SectionTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { brandTitle } from '@/lib/brandTitle'

export const metadata: Metadata = {
  title: brandTitle('Náhled: karty soupisky'),
  robots: { index: false, follow: false },
}

const GRID =
  'mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:[grid-template-columns:repeat(auto-fill,minmax(13rem,1fr))] md:gap-x-5.5 md:gap-y-8 lg:[grid-template-columns:repeat(auto-fill,minmax(16.125rem,1fr))]'

/** Dlouhá jména a chybějící fotka — krajní případy, které reálná data nemusí mít. */
const EDGE_CASES: RosterCard[] = [
  { key: 'e1', name: 'Ing. Lukáš Beránek', kicker: 'Obránce', number: 88, photo: null },
  { key: 'e2', name: 'Jaroslav Macháček', kicker: 'Útočník', number: 7, photo: null },
  { key: 'e3', name: 'Tomáš Novák', kicker: 'Brankář', number: 1, photo: null },
  { key: 'e4', name: 'Jan Dvořák', kicker: 'Asistent trenéra mužů', number: null, photo: null },
]

/**
 * Interní náhled karty hráče „dresový štítek" (varianta D) vedle současné
 * karty. Reálná data z kolekce `players` a `people`, krajní případy dole.
 * Neindexuje se.
 */
export default async function RosterCardsPreviewPage() {
  const [sections, people] = await Promise.all([fetchRosterSections(), fetchAllPeople()])

  const cards: RosterCard[] = [
    ...sections.flatMap((section) =>
      section.players.map((player): RosterCard => ({
        key: `player-${player.id}`,
        name: player.name,
        kicker: (player.position && POSITION_LABEL[player.position]) || 'Hráč',
        number: player.number,
        photo: player.photo,
      })),
    ),
    ...people.map((person, index): RosterCard => ({
      key: `person-${index}`,
      name: person.name,
      kicker: person.role,
      number: null,
      photo: person.photo,
    })),
  ]

  return (
    <SubpageShell hatch={false} surface="paper">
      <header className="mx-auto max-w-page px-gutter pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Karty soupisky
        </PageTitle>
      </header>

      <SectionShell spacing="section">
        <SectionTitle>Nová karta „dresový štítek“</SectionTitle>
        <ul className={GRID}>
          {cards.map((card) => (
            <li key={card.key}>
              <PlayerTileJersey card={card} />
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell spacing="section">
        <SectionTitle>Krajní případy (bez fotky, dlouhá jména)</SectionTitle>
        <ul className={GRID}>
          {EDGE_CASES.map((card) => (
            <li key={card.key}>
              <PlayerTileJersey card={card} />
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell spacing="section">
        <SectionTitle>Současná karta (pro srovnání)</SectionTitle>
        <ul className={GRID}>
          {cards.slice(0, 8).map((card) => (
            <li key={card.key}>
              <PlayerTile card={card} />
            </li>
          ))}
        </ul>
      </SectionShell>
    </SubpageShell>
  )
}
