import type { Metadata } from 'next'
import React from 'react'

import { fetchAllPeople } from '@/landing/data/site'
import { fetchSeason, seasonShortLabel } from '@/landing/features/matches/data/seasons'
import type { RosterCard } from '@/landing/features/roster/components/PlayerTile'
import { RosterCta } from '@/landing/features/roster/components/RosterCta'
import { RosterHeader } from '@/landing/features/roster/components/RosterHeader'
import { RosterSection } from '@/landing/features/roster/components/RosterSection'
import {
  fetchPlayerSeasonStats,
  fetchRosterSections,
  POSITION_LABEL,
} from '@/landing/features/roster/data'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { countLabel } from '@/landing/lib/text'
import { SectionShell } from '@/landing/ui/SectionShell'

export const revalidate = 600

const PLAYER_FORMS: [string, string, string] = ['hráč', 'hráči', 'hráčů']
const PEOPLE_FORMS: [string, string, string] = ['člověk', 'lidé', 'lidí']

/**
 * Pilulka Z/G/A/B/TM na kartách hráčů je zatím skrytá (rozhodnutí správce,
 * 14. 10. 2026). Data se dál synchronizují; vypnutý je jen dotaz a vykreslení,
 * takže zapnutí je změna téhle konstanty.
 */
const SHOW_SEASON_STATS = false

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

  // Statistiky jsou doplněk — bez aktuální sezóny se karty kreslí bez nich.
  const stats = SHOW_SEASON_STATS && season ? await fetchPlayerSeasonStats(season.id) : {}

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
      <RosterHeader
        pills={pills}
        seasonLabel={season ? seasonShortLabel(season) : null}
        summary={summary}
      />

      {/* Rytmus mezi sekcemi kopíruje škálu `SectionShell spacing="section"`
          (72 / 96 / 140px) — plochých 72px napříč breakpointy bylo na 1440px
          ploše proti rytmu ostatních podstránek. */}
      <SectionShell className="space-y-18 md:space-y-24 lg:space-y-35" spacing="content">
        {sections.map((section) => (
          <RosterSection
            anchor={section.anchor}
            cards={section.players.map((player): RosterCard => ({
              key: `player-${player.id}`,
              name: player.name,
              kicker: (player.position && POSITION_LABEL[player.position]) || 'Hráč',
              number: player.number,
              photo: player.photo,
              stats: stats[player.id]
                ? { ...stats[player.id], goalie: player.position === 'G' }
                : null,
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
            cards={people.map((person, index): RosterCard => ({
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
