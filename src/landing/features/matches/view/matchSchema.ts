import { CLUB_NAME } from '@/lib/club'

/**
 * Stavba schema.org `SportsEvent` sdílená výpisem `/zapasy`
 * (`MatchesJsonLd`) a detailem zápasu (`MatchJsonLd`).
 * Žije na jednom místě, aby se oba výstupy nerozešly.
 *
 * Odehraný zápas zůstává `EventScheduled` — schema.org žádný stav
 * „dohráno" nemá a zbylé hodnoty (`Postponed`, `MovedOnline`) by byly
 * nepravdivé; výsledek proto nese `description`. Zrušený zápas je
 * `EventCancelled`, to je pravdivý stav.
 *
 * `location` se vynechává, když místo neznáme. Adresu k němu neskládáme:
 * `venue` je v CMS volný text („Rychnov n. K.", „ZS Polička"), takže
 * strukturovaná `PostalAddress` by tvrdila víc, než o místě víme.
 */

/** Domácí led klubu — `Match.venue` bývá u domácích zápasů prázdné. */
const HOME_VENUE = 'Zimní stadion Rychnov nad Kněžnou'

const ORGANIZER = { '@type': 'SportsOrganization', name: 'Východočeská hokejová liga' }

const team = (name: string) => ({ '@type': 'SportsTeam', name })

export type SportsEventInput = {
  title: string
  startDate: string
  homeName: string
  awayName: string
  venue: string | null
  status: 'scheduled' | 'played' | 'canceled'
  description: string | null
  /** Absolutní URL detailu zápasu. */
  url: string
}

export const toSportsEvent = ({
  awayName,
  description,
  homeName,
  startDate,
  status,
  title,
  url,
  venue,
}: SportsEventInput) => {
  const placeName = venue ?? (homeName === CLUB_NAME ? HOME_VENUE : null)

  return {
    '@type': 'SportsEvent',
    name: title,
    sport: 'Ice Hockey',
    startDate,
    eventStatus:
      status === 'canceled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
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

/**
 * Popis události z kola/fáze a výsledku („18. kolo — HC Čestice 5:3 HC Zdar").
 * `score` je v pořadí domácí : hosté, `null` u nehraného zápasu.
 */
export const eventDescription = (
  stage: string,
  score: string | null,
  homeName: string,
  awayName: string,
): string => [stage, score && `${homeName} ${score} ${awayName}`].filter(Boolean).join(' — ')
