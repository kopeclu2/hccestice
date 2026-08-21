import type { Metadata } from 'next'

import React from 'react'

import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { countLabel } from '@/landing/data/format'
import { fetchRosterSections, POSITION_LABEL } from '@/landing/data/players'
import { fetchSeason, seasonShortLabel } from '@/landing/data/seasons'
import { fetchAllPeople } from '@/landing/data/site'
import type { SoupiskaCard } from '@/landing/soupiska/PlayerTile'
import { RosterCta } from '@/landing/soupiska/RosterCta'
import { RosterSection } from '@/landing/soupiska/RosterSection'
import { SoupiskaHeader } from '@/landing/soupiska/SoupiskaHeader'

export const revalidate = 600

const PLAYER_FORMS: [string, string, string] = ['hráč', 'hráči', 'hráčů']
const PEOPLE_FORMS: [string, string, string] = ['člověk', 'lidé', 'lidí']

/**
 * Soupiska A-týmu v landing designu — handoff „HC Cestice Soupiska".
 *
 * Hráči z kolekce `players` (jen aktivní) seskupení podle postu,
 * realizační tým z kolekce `people`. Karty nejsou klikací — hráči
 * nemají detailové stránky.
 */
export default async function SoupiskaPage() {
  const [sections, people, season] = await Promise.all([
    fetchRosterSections(),
    fetchAllPeople(),
    fetchSeason(null),
  ])

  const totalPlayers = sections.reduce((sum, section) => sum + section.players.length, 0)
  const summary =
    people.length > 0
      ? `${countLabel(totalPlayers, PLAYER_FORMS)} + realizační tým`
      : countLabel(totalPlayers, PLAYER_FORMS)

  const pills = [
    ...sections.map((section) => ({
      href: `#${section.anchor}`,
      label: section.title,
      count: section.players.length,
    })),
    ...(people.length > 0
      ? [{ href: '#realizacni-tym', label: 'Realizační tým', count: people.length }]
      : []),
  ]

  return (
    <SubpageShell>
      <SoupiskaHeader
        pills={pills}
        seasonLabel={season ? seasonShortLabel(season) : null}
        summary={summary}
      />

      <SectionShell className="space-y-18" spacing="content">
        {sections.map((section) => (
          <RosterSection
            anchor={section.anchor}
            cards={section.players.map((player): SoupiskaCard => ({
              key: `player-${player.id}`,
              name: player.name,
              kicker: (player.position && POSITION_LABEL[player.position]) || 'Hráč',
              number: player.number,
              photo: player.photo,
            }))}
            count={countLabel(section.players.length, PLAYER_FORMS)}
            key={section.anchor}
            kicker={section.kicker}
            title={section.title}
          />
        ))}

        {people.length > 0 && (
          <RosterSection
            anchor="realizacni-tym"
            cards={people.map((person, index): SoupiskaCard => ({
              key: `person-${index}-${person.name}`,
              name: person.name,
              kicker: person.role,
              number: null,
              photo: person.photo,
            }))}
            count={countLabel(people.length, PEOPLE_FORMS)}
            kicker="Staff"
            title="Realizační tým"
          />
        )}
      </SectionShell>

      <RosterCta />
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Soupiska | HC Čestice',
  description:
    'A-tým mužů HC Čestice ve Východočeské hokejové lize — brankáři, obránci, útočníci a realizační tým.',
  alternates: { canonical: '/soupiska' },
}
