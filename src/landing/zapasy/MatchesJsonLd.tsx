import React from 'react'

import { getServerSideURL } from '@/utilities/getURL'

import type { FixtureCard, ResultRow } from '../types'

/**
 * JSON-LD (schema.org `SportsEvent`) pro rozlosování i odehrané zápasy.
 *
 * `/zapasy` dřív nesla jen `BreadcrumbList` — samotné zápasy, tedy jediný
 * obsah, kvůli kterému na stránku někdo chodí, nebyly strukturovaně
 * popsané vůbec.
 *
 * Vstupem jsou **vykreslené** karty a řádky, ne vlastní dotaz do databáze.
 * Výpis výsledků je stránkovaný po šesti, takže dotaz na celou sezónu by
 * inzeroval zápasy, které na stránce nejsou — strukturovaná data mají
 * popisovat to, co návštěvník vidí.
 */

/** Domácí led klubu — `Match.venue` bývá u domácích zápasů prázdné. */
const HOME_VENUE = 'Zimní stadion Rychnov nad Kněžnou'

const CLUB_NAME = 'HC Čestice'

const ORGANIZER = { '@type': 'SportsOrganization', name: 'Východočeská hokejová liga' }

const team = (name: string) => ({ '@type': 'SportsTeam', name })

type EventInput = {
  title: string
  startDate: string
  homeName: string
  awayName: string
  venue: string | null
  /** Kolo nebo fáze soutěže („19. kolo", „semifinále"). */
  stage: string
  /** Skóre domácí : hosté; `null` u nadehraného zápasu. */
  score: string | null
  url: string
}

/**
 * Odehraný zápas zůstává `EventScheduled` — schema.org žádný stav
 * „dohráno" nemá a zbylé hodnoty (`Cancelled`, `Postponed`, `MovedOnline`)
 * by byly nepravdivé. Výsledek proto nese `description`; vlastnost pro
 * skóre `SportsEvent` nedefinuje.
 *
 * `location` se vynechává, když místo neznáme. Adresu k němu neskládáme:
 * `venue` je v CMS volný text („Rychnov n. K.", „ZS Polička"), takže
 * strukturovaná `PostalAddress` by tvrdila víc, než o místě víme.
 */
const toEvent = ({
  awayName,
  homeName,
  score,
  stage,
  startDate,
  title,
  url,
  venue,
}: EventInput) => {
  const placeName = venue ?? (homeName === CLUB_NAME ? HOME_VENUE : null)
  const description = [stage, score && `${homeName} ${score} ${awayName}`]
    .filter(Boolean)
    .join(' — ')

  return {
    '@type': 'SportsEvent',
    name: title,
    sport: 'Ice Hockey',
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    homeTeam: team(homeName),
    awayTeam: team(awayName),
    competitor: [team(homeName), team(awayName)],
    organizer: ORGANIZER,
    ...(description ? { description } : {}),
    ...(placeName ? { location: { '@type': 'Place', name: placeName } } : {}),
    url,
  }
}

export function MatchesJsonLd({
  fixtures,
  results,
}: {
  fixtures: FixtureCard[]
  results: ResultRow[]
}) {
  const url = `${getServerSideURL()}/zapasy`

  const events = [
    ...fixtures.map((fixture) => toEvent({ ...fixture, score: null, url })),
    ...results.map((row) => toEvent({ ...row, url })),
  ]

  if (!events.length) return null

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': events }),
      }}
      type="application/ld+json"
    />
  )
}
