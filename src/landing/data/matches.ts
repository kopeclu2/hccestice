import type { Match } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type {
  Fixture,
  FixtureCard,
  FormSquare,
  LastResult,
  MatchCardData,
  MatchReport,
  MatchRow,
  Outcome,
  ResultRow,
  TeamForm,
  UpcomingMatch,
} from '../types'

import {
  formatDateTime,
  formatDay,
  formatTime,
  formatWeekdayDay,
  postPath,
  toPhoto,
  uploadToPhoto,
} from './format'

/**
 * Zápasy — fetchery a odvozeniny pro hero countdown, karty reportů,
 * rozpisy i widgety. Vše přes React `cache()` (dedup v rámci requestu).
 */

/** Jméno soupeře z relace (zápasy mají depth ≥ 1). */
const opponentName = (match: Match): string =>
  typeof match.opponent === 'object' && match.opponent ? match.opponent.name : 'Soupeř'

/** „HC Čestice × Soupeř" v pořadí domácí × hosté. */
export const matchTitle = (match: Match): string =>
  match.home ? `HC Čestice × ${opponentName(match)}` : `${opponentName(match)} × HC Čestice`

/** Skóre v pořadí domácí : hosté (zápas ukládá góly z našeho pohledu). */
export const matchScore = (match: Match): string => {
  const ours = match.scoreOurs ?? 0
  const theirs = match.scoreOpp ?? 0
  return match.home ? `${ours}:${theirs}` : `${theirs}:${ours}`
}

export const scoreSuffix = (match: Match): '' | 'sn' | 'pp' =>
  match.shootout ? 'sn' : match.overtime ? 'pp' : ''

/** Výsledek z pohledu Čestic (jen u odehraných zápasů). */
export const matchOutcome = (match: Match): Outcome => {
  const ours = match.scoreOurs ?? 0
  const theirs = match.scoreOpp ?? 0
  if (ours > theirs) return 'win'
  if (ours < theirs) return 'loss'
  return 'draw'
}

const ROUND_PATTERN = /(\d+)\.\s*kolo/i
const PHASE_PATTERN =
  /(čtvrtfinále|semifinále|finále|o 3\. místo|play-?off|baráž|turnaj|přátel\w*)/i

/**
 * Krátký štítek soutěže do karet a výpisů — texty v CMS bývají dlouhé
 * („2. kolo OLLH play-off"), štítek má ale jen pár znaků na šířku.
 * Přednost má číslo kola, pak fáze soutěže; jinak zůstane text celý.
 */
export const phaseLabel = (match: Match): string => {
  const competition = (match.competition ?? '').replace(/^VČHL\s*(play-off\s*)?/i, '').trim()
  if (!competition) return 'VČHL'

  const round = competition.match(ROUND_PATTERN)
  if (round) return `${round[1]}. kolo`

  const phase = competition.match(PHASE_PATTERN)
  const label = phase ? phase[1] : competition
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Fotka reprezentující galerii zápasu — cover, jinak první fotka alba. */
const galleryPhoto = (gallery: Match['gallery']) => {
  if (typeof gallery !== 'object' || !gallery) return null
  if (typeof gallery.cover === 'object' && gallery.cover) return toPhoto(gallery.cover)
  return uploadToPhoto(gallery.photos?.[0]?.image)
}

const toMatchRow = (match: Match): MatchRow => ({
  id: match.id,
  dateLabel: formatWeekdayDay(match.date),
  timeLabel: formatTime(match.date),
  title: matchTitle(match),
  home: Boolean(match.home),
  score: match.status === 'played' ? matchScore(match) : null,
  suffix: scoreSuffix(match),
})

/** Nejbližší naplánovaný zápas (countdown) + výčet dalších kol. */
export const fetchUpcoming = cache(
  async (): Promise<{ upcoming: UpcomingMatch | null; fixtures: Fixture[] }> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'matches',
      where: {
        and: [
          { status: { equals: 'scheduled' } },
          { date: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      sort: 'date',
      limit: 4,
      depth: 1,
    })

    const [next] = docs
    const upcoming: UpcomingMatch | null = next
      ? {
          title: matchTitle(next),
          kickoffISO: next.date,
          subtitle: [formatDateTime(next.date), next.venue].filter(Boolean).join(' · '),
          label: next.competition ?? 'VČHL',
        }
      : null

    const fixtures: Fixture[] = docs.map((match) => ({
      id: match.id,
      dateLabel: formatWeekdayDay(match.date),
      timeLabel: formatTime(match.date),
      title: matchTitle(match),
      home: Boolean(match.home),
    }))

    return { upcoming, fixtures }
  },
)

/** Poslední výsledek + karty reportů (foto z nalinkované galerie zápasu). */
export const fetchPlayed = cache(
  async (): Promise<{ lastResult: LastResult | null; reports: MatchReport[] }> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'matches',
      where: { status: { equals: 'played' } },
      sort: '-date',
      limit: 4,
      depth: 2,
    })

    const [last] = docs
    const lastResult: LastResult | null = last
      ? {
          title: matchTitle(last),
          score: matchScore(last),
          suffix: scoreSuffix(last),
          dateLabel: `${formatDay(last.date)} · ${phaseLabel(last)}`,
          won: (last.scoreOurs ?? 0) > (last.scoreOpp ?? 0),
        }
      : null

    const reports: MatchReport[] = docs.map((match) => ({
      id: match.id,
      title: matchTitle(match),
      badge: `${formatDay(match.date)} · ${phaseLabel(match)}`,
      score: matchScore(match),
      suffix: scoreSuffix(match),
      photo: galleryPhoto(match.gallery),
    }))

    return { lastResult, reports }
  },
)

/** Seznam zápasů pro widget — výsledky (se skóre) nebo rozpis. */
export const fetchMatchRows = cache(
  async (options: {
    mode: 'results' | 'schedule'
    seasonId?: number | null
    teamId?: number | null
    limit: number
  }): Promise<MatchRow[]> => {
    const payload = await getPayload({ config: configPromise })
    const and: Array<Record<string, unknown>> = [
      { status: { equals: options.mode === 'results' ? 'played' : 'scheduled' } },
    ]
    if (options.mode === 'schedule') {
      and.push({ date: { greater_than_equal: new Date().toISOString() } })
    }
    if (options.seasonId) and.push({ season: { equals: options.seasonId } })
    if (options.teamId) and.push({ team: { equals: options.teamId } })

    const { docs } = await payload.find({
      collection: 'matches',
      where: { and } as never,
      sort: options.mode === 'results' ? '-date' : 'date',
      limit: options.limit,
      depth: 1,
    })
    return docs.map(toMatchRow)
  },
)

/** Vybrané zápasy (v pořadí výběru) → řádky widgetu. */
export const fetchPickedMatchRows = cache(async (matchIds: number[]): Promise<MatchRow[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'matches',
    where: { id: { in: matchIds } },
    limit: matchIds.length,
    depth: 1,
  })
  const byId = new Map(docs.map((match) => [match.id, match]))
  return matchIds
    .map((id) => byId.get(id))
    .filter((match): match is Match => Boolean(match))
    .map(toMatchRow)
})

/* ── /zapasy ─────────────────────────────────────────────────────────────── */

/** Rozlosování sezóny — celé, od nejbližšího zápasu (pás karet na /zapasy). */
export const fetchSeasonFixtures = cache(async (seasonId: number): Promise<FixtureCard[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'matches',
    where: {
      and: [
        { season: { equals: seasonId } },
        { status: { equals: 'scheduled' } },
        { date: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    sort: 'date',
    limit: 0,
    depth: 1,
  })

  return docs.map((match, index) => ({
    id: match.id,
    kind: match.home ? 'Doma' : 'Venku',
    stage: phaseLabel(match),
    dateLabel: formatDay(match.date),
    timeLabel: formatTime(match.date),
    title: matchTitle(match),
    venue: match.venue ?? null,
    isNext: index === 0,
  }))
})

const toResultRow = (match: Match): ResultRow => ({
  id: match.id,
  dateLabel: formatDay(match.date),
  stage: phaseLabel(match),
  title: matchTitle(match),
  venue: match.venue ?? null,
  score: matchScore(match),
  suffix: scoreSuffix(match),
  outcome: matchOutcome(match),
})

/** Odehrané zápasy sezóny po stranách (výpis na /zapasy, 6 na stranu). */
export const fetchSeasonResults = cache(
  async (options: {
    seasonId: number
    page: number
    perPage: number
  }): Promise<{ rows: ResultRow[]; page: number; totalPages: number; totalDocs: number }> => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'matches',
      where: {
        and: [{ season: { equals: options.seasonId } }, { status: { equals: 'played' } }],
      },
      sort: '-date',
      limit: options.perPage,
      page: options.page,
      depth: 1,
    })

    return {
      rows: result.docs.map(toResultRow),
      page: result.page ?? 1,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
    }
  },
)

/**
 * Poslední odehrané zápasy bez ohledu na sezónu — výřez „Odehrané
 * zápasy" na home page, aby po startu nové sezóny nezůstal prázdný.
 */
export const fetchLatestResults = cache(async (limit: number): Promise<ResultRow[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'matches',
    where: { status: { equals: 'played' } },
    sort: '-date',
    limit,
    depth: 1,
  })
  return docs.map(toResultRow)
})

const OUTCOME_LETTER: Record<Outcome, string> = { win: 'V', draw: 'R', loss: 'P' }

/** Forma za posledních 5 odehraných zápasů sezóny (zleva nejstarší). */
export const fetchSeasonForm = cache(async (seasonId: number): Promise<TeamForm | null> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'matches',
    where: {
      and: [{ season: { equals: seasonId } }, { status: { equals: 'played' } }],
    },
    sort: '-date',
    limit: 5,
    depth: 1,
  })
  if (docs.length === 0) return null

  const squares: FormSquare[] = docs
    .map((match) => ({
      id: match.id,
      letter: OUTCOME_LETTER[matchOutcome(match)],
      outcome: matchOutcome(match),
      score: matchScore(match),
      suffix: scoreSuffix(match),
      stage: phaseLabel(match),
      title: matchTitle(match),
      dateLabel: formatDay(match.date),
    }))
    .reverse()

  const counts = { win: 0, draw: 0, loss: 0 }
  for (const square of squares) counts[square.outcome] += 1

  return {
    squares,
    summary: `${counts.win}× výhra · ${counts.draw}× remíza · ${counts.loss}× prohra`,
  }
})

/** Jeden zápas pro velkou kartu — depth 2 kvůli logu soupeře a reportáži. */
export const fetchMatchCard = cache(async (matchId: number): Promise<MatchCardData | null> => {
  const payload = await getPayload({ config: configPromise })
  const match = await payload.findByID({ collection: 'matches', id: matchId, depth: 2 })
  if (!match) return null

  const opponent = typeof match.opponent === 'object' ? match.opponent : null
  const report = typeof match.report === 'object' ? match.report : null

  return {
    id: match.id,
    status: match.status,
    dateLabel: formatDateTime(match.date),
    competition: match.competition ?? null,
    venue: match.venue ?? null,
    home: Boolean(match.home),
    opponentName: opponent?.name ?? 'Soupeř',
    opponentLogo:
      opponent && typeof opponent.logo === 'object' && opponent.logo
        ? toPhoto(opponent.logo)
        : null,
    score: match.status === 'played' ? matchScore(match) : null,
    suffix: scoreSuffix(match),
    won: match.status === 'played' ? (match.scoreOurs ?? 0) > (match.scoreOpp ?? 0) : null,
    reportHref: postPath(report?.slug),
  }
})
