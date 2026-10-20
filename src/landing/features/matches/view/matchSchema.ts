import { ARENA_ADDRESS, ARENA_NAME, CLUB_NAME, MATCH_DURATION_MINUTES } from '@/lib/club'
import { toDate, toPragueIso } from '@/lib/datetime'
import { fold } from '@/lib/fold'

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
 * `location` je `Place` s `address` (Google Event ho vyžaduje). Domácí halu
 * známe celou; u cizích hal je `venue` v CMS volný text („ZS Polička",
 * „Choceň"), takže se město odvozuje jen tam, kde je spolehlivé
 * (`resolveVenue`), jinak zůstane `addressCountry`. Místo, které neznáme
 * vůbec (venkovní zápas bez `venue`), se vynechá — vymýšlet ho by byla lež.
 */

const ORGANIZER = { '@type': 'SportsOrganization', name: 'Východočeská hokejová liga' }

const team = (name: string) => ({ '@type': 'SportsTeam', name })

/**
 * Hala rozpoznaná z textu v CMS. `arena` je naše domácí hala, `other` cizí
 * s městem, pokud se dá z názvu odvodit spolehlivě.
 */
export type VenueRef = { kind: 'arena' } | { kind: 'other'; name: string; locality: string | null }

/** Předpony „zimák" před městem — `ZS Polička`, `Zimní stadion Lanškroun`. */
const STADIUM_PREFIX = /^(?:zimní\s+stadi[oó]n|zs|zimák)\s+/iu

/** Podoby města Rychnova (po sloučení bez diakritiky) rozpoznané jako naše hala. */
const ARENA_TOWN_FORMS = new Set(['rychnov nad kneznou', 'rychnov n k'])

/** Slova, která z názvu dělají halu nebo klub, ne město („Aréna Hokej Park"). */
const NOT_A_TOWN =
  /\b(?:arena|hala|hokej|park|kluziste|stadion|areal|centrum|sportovni|sokolovna|dum|hriste|hc|sk|tj)\b/

const TOWN_PARTICLES = new Set(['nad', 'pod', 'u', 'na', 'v', 've', 'při'])

/**
 * Vypadá `text` jako název obce („Polička", „Nové Město nad Metují")? Jedna
 * až pět slov bez číslic a teček; první slovo velkým písmenem. Zkratky
 * („Rychnov n. K.") a názvy hal se zamítají — radši bez města než špatné.
 */
const looksLikeTown = (text: string): boolean => {
  const words = text.trim().split(/\s+/)
  if (words.length === 0 || words.length > 5 || NOT_A_TOWN.test(fold(text))) return false
  return words.every((word, index) => {
    if (!/^[\p{L}'’-]+$/u.test(word)) return false
    if (index === 0) return /^\p{Lu}/u.test(word)
    return /^\p{Lu}/u.test(word) || TOWN_PARTICLES.has(word)
  })
}

/**
 * Rozpozná halu z `venue` zápasu. Bez `venue` je domácí zápas na naší hale,
 * venkovní zápas bez místa je `null`.
 */
export function resolveVenue(venue: string | null, homeIsClub: boolean): VenueRef | null {
  const raw = venue?.trim()
  if (!raw) return homeIsClub ? { kind: 'arena' } : null

  const withoutPrefix = raw.replace(STADIUM_PREFIX, '').trim()
  if (ARENA_TOWN_FORMS.has(fold(withoutPrefix, { alnumOnly: true }))) return { kind: 'arena' }

  const hadPrefix = withoutPrefix !== raw
  const candidate = hadPrefix ? withoutPrefix : raw
  return { kind: 'other', name: raw, locality: looksLikeTown(candidate) ? candidate : null }
}

const placeNode = (ref: VenueRef) =>
  ref.kind === 'arena'
    ? {
        '@type': 'Place',
        name: ARENA_NAME,
        address: { '@type': 'PostalAddress', ...ARENA_ADDRESS },
      }
    : {
        '@type': 'Place',
        name: ref.name,
        address: {
          '@type': 'PostalAddress',
          ...(ref.locality ? { addressLocality: ref.locality } : {}),
          addressCountry: 'CZ',
        },
      }

/** Konec události: začátek + odhad délky zápasu; `null` pro neplatné datum. */
export function eventEndDate(startDate: string): string | null {
  const start = toDate(startDate)
  return start ? toPragueIso(start.getTime() + MATCH_DURATION_MINUTES * 60_000) : null
}

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
  /** Absolutní URL obrázku události (fotka reportáže, jinak OG fallback). */
  image: string
}

export const toSportsEvent = ({
  awayName,
  description,
  homeName,
  image,
  startDate,
  status,
  title,
  url,
  venue,
}: SportsEventInput) => {
  const place = resolveVenue(venue, homeName === CLUB_NAME)
  const endDate = eventEndDate(startDate)

  return {
    '@type': 'SportsEvent',
    name: title,
    sport: 'Ice Hockey',
    // Lokální offset (+01:00/+02:00), ne `…Z` — viz `toPragueIso`.
    startDate: toPragueIso(startDate) ?? startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus:
      status === 'canceled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    homeTeam: team(homeName),
    awayTeam: team(awayName),
    competitor: [team(homeName), team(awayName)],
    organizer: ORGANIZER,
    image: [image],
    ...(description ? { description } : {}),
    ...(place ? { location: placeNode(place) } : {}),
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
