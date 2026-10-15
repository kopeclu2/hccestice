import type {
  FixtureCard,
  FormSquare,
  LastResult,
  MatchRow,
  MatchSchemaFields,
  Outcome,
  ResultRow,
  TeamLogos,
  UpcomingMatch,
} from '@/landing/features/matches/types'
import { uploadToPhoto } from '@/landing/lib/media'
import { CLUB_NAME } from '@/lib/club'
import {
  formatDateTime,
  formatWeekday,
  formatDay,
  formatTime,
  formatWeekdayDay,
} from '@/lib/datetime'
import { linkOrNull, routes } from '@/lib/routes'
import type { Match } from '@/payload-types'

import {
  CLUB_LOGO,
  formatCompetition,
  matchOutcome,
  matchScore,
  matchTitle,
  opponentName,
  phaseLabel,
  scorersLabel,
  scoreSuffix,
} from './matchFormat'

/**
 * Mapování zápasu (`Match`) na view-modely výpisů, widgetů a hero.
 *
 * Čisté funkce bez Payloadu za běhu — fetchery v `matches.ts` jen dotahují
 * data a tahle vrstva z nich skládá řádky. Díky tomu se dá testem ověřit,
 * že každé zobrazení zápasu nese odkaz na detail (`href` ze slugu).
 */

/**
 * Pole pro `SportsEvent`. Zápas ukládá jen `home` a soupeře, takže se
 * strany musí prohodit stejně jako v `matchTitle` — proto společný
 * helper a ne dvě místa, kde se dá pořadí splést.
 */
export const schemaFields = (match: Match): MatchSchemaFields => ({
  startDate: match.date,
  homeName: match.home ? CLUB_NAME : opponentName(match),
  awayName: match.home ? opponentName(match) : CLUB_NAME,
})

/**
 * Znaky v pořadí domácí / hosté. Logo soupeře je jen při populované relaci
 * `opponent.logo` (fetcher s `depth: 2`); jinde (`depth: 1`) zůstane null
 * a řádek ukáže monogram.
 */
export const teamLogos = (match: Match): TeamLogos => {
  const opponent = typeof match.opponent === 'object' ? match.opponent : null
  const opponentLogo = uploadToPhoto(opponent?.logo)
  return {
    homeLogo: match.home ? CLUB_LOGO : opponentLogo,
    awayLogo: match.home ? opponentLogo : CLUB_LOGO,
  }
}

/** Odkaz na detail zápasu; zápas bez slugu (dokument z doby před slugy) detail nemá. */
const hrefOf = (match: Pick<Match, 'slug'>): string | null => linkOrNull(routes.match, match.slug)

export const toMatchRow = (match: Match): MatchRow => ({
  id: match.id,
  dateLabel: formatWeekdayDay(match.date),
  timeLabel: formatTime(match.date),
  title: matchTitle(match),
  home: Boolean(match.home),
  score: match.status === 'played' ? matchScore(match) : null,
  suffix: scoreSuffix(match),
  href: hrefOf(match),
})

export const toUpcoming = (match: Match): UpcomingMatch => ({
  title: matchTitle(match),
  kickoffISO: match.date,
  subtitle: [formatDateTime(match.date), match.venue].filter(Boolean).join(' · '),
  label: formatCompetition(match.competition) ?? 'VČHL',
  href: hrefOf(match),
})

export const toLastResult = (match: Match): LastResult => ({
  title: matchTitle(match),
  score: matchScore(match),
  suffix: scoreSuffix(match),
  dateLabel: `${formatDay(match.date)} · ${phaseLabel(match)}`,
  won: (match.scoreOurs ?? 0) > (match.scoreOpp ?? 0),
  href: hrefOf(match),
})

export const toFixtureCard = (match: Match, isNext: boolean): FixtureCard => ({
  ...schemaFields(match),
  ...teamLogos(match),
  id: match.id,
  weekdayLabel: formatWeekday(match.date),
  kind: match.home ? 'Doma' : 'Venku',
  stage: phaseLabel(match),
  dateLabel: formatDay(match.date),
  timeLabel: formatTime(match.date),
  title: matchTitle(match),
  venue: match.venue ?? null,
  isNext,
  href: hrefOf(match),
})

export const toResultRow = (match: Match): ResultRow => ({
  ...schemaFields(match),
  ...teamLogos(match),
  id: match.id,
  weekdayLabel: formatWeekday(match.date),
  dateLabel: formatDay(match.date),
  stage: phaseLabel(match),
  title: matchTitle(match),
  venue: match.venue ?? null,
  score: matchScore(match),
  suffix: scoreSuffix(match),
  outcome: matchOutcome(match),
  scorers: scorersLabel(match),
  href: hrefOf(match),
})

/** Prohra po prodloužení / nájezdech je taky „P" — odliší ji půlená barva čtverečku. */
const OUTCOME_LETTER: Record<Outcome, string> = { win: 'V', draw: 'R', otLoss: 'P', loss: 'P' }

export const toFormSquare = (match: Match): FormSquare => ({
  id: match.id,
  letter: OUTCOME_LETTER[matchOutcome(match)],
  outcome: matchOutcome(match),
  score: matchScore(match),
  suffix: scoreSuffix(match),
  stage: phaseLabel(match),
  title: matchTitle(match),
  dateLabel: formatDay(match.date),
  href: hrefOf(match),
})
