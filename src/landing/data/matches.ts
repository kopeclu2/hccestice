import type { Match } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { cache } from 'react'

import type {
  FixtureCard,
  FormSquare,
  LastResult,
  MatchCardData,
  MatchRow,
  ResultRow,
  TeamForm,
  UpcomingMatch,
} from '../types'

import { formatDateTime, matchPath, postPath, toPhoto } from './format'
import { resolveReport } from './matchDetail'
import {
  matchOutcome,
  matchScore,
  matchTitle,
  phaseLabel,
  scorersLabel,
  scoreSuffix,
} from './matchFormat'
import {
  toFixtureCard,
  toFormSquare,
  toLastResult,
  toMatchRow,
  toResultRow,
  toUpcoming,
} from './matchRows'
import { CACHE_TAGS } from './tags'

// Čisté popisky zápasu žijí v `matchFormat.ts` (testy je importují bez Payloadu);
// odtud se re-exportují, aby zůstaly dosavadní importy beze změny.
export { matchOutcome, matchScore, matchTitle, phaseLabel, scorersLabel, scoreSuffix }

/**
 * Zápasy — fetchery a odvozeniny pro hero countdown, karty reportů,
 * rozpisy i widgety. Vše přes React `cache()` (dedup v rámci requestu);
 * fetchery pro plně dynamickou `/zapasy` navíc přes `unstable_cache`.
 */

/**
 * Hranice „od teď" pro filtr naplánovaných zápasů, zaokrouhlená na
 * celou hodinu.
 *
 * Musí se počítat **mimo** cachovanou funkci a předávat jako argument:
 * `unstable_cache` skládá klíč z argumentů, takže se každou hodinu založí
 * nová entry. Kdyby `new Date()` zůstalo uvnitř, zamrzlo by v cache na
 * celou dobu její životnosti (dnes hodina, bez `revalidate` rok) a
 * odehraný zápas by zůstal v rozlosování.
 */
const scheduleFrom = (): string => {
  const boundary = new Date()
  boundary.setMinutes(0, 0, 0)
  return boundary.toISOString()
}

/** Nejbližší naplánovaný zápas (countdown). */
export const fetchUpcoming = cache(
  async (): Promise<{ upcoming: UpcomingMatch | null }> => {
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
      limit: 1,
      depth: 1,
    })

    const [next] = docs
    return { upcoming: next ? toUpcoming(next) : null }
  },
)

/** Poslední výsledek (hero). */
export const fetchPlayed = cache(
  async (): Promise<{ lastResult: LastResult | null }> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'matches',
      where: { status: { equals: 'played' } },
      sort: '-date',
      limit: 1,
      depth: 1,
    })

    const [last] = docs
    return { lastResult: last ? toLastResult(last) : null }
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

/*
 * Klíče tagovaných cache nesou verzi tvaru (`v2` = výsledek má `href` na detail
 * zápasu, `v3` = výsledek `otLoss`). `unstable_cache` skládá klíč jen z těchto řetězců a argumentů, takže
 * entry uložená před změnou tvaru by bez nového klíče žila až do `revalidate`
 * (hodina) bez odkazů. Tag (`matches-list`) zůstává, takže hook zápasů
 * invaliduje i nové entry.
 */

/** Rozlosování sezóny — celé, od nejbližšího zápasu (pás karet na /zapasy). */
const loadSeasonFixtures = unstable_cache(
  async (seasonId: number, from: string): Promise<FixtureCard[]> => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'matches',
      where: {
        and: [
          { season: { equals: seasonId } },
          { status: { equals: 'scheduled' } },
          { date: { greater_than_equal: from } },
        ],
      },
      sort: 'date',
      limit: 0,
      depth: 1,
    })

    return docs.map((match, index) => toFixtureCard(match, index === 0))
  },
  ['season-fixtures', 'v2'],
  { tags: [CACHE_TAGS.matches], revalidate: 3600 },
)

export const fetchSeasonFixtures = cache(
  async (seasonId: number): Promise<FixtureCard[]> => loadSeasonFixtures(seasonId, scheduleFrom()),
)

/** Odehrané zápasy sezóny po stranách (výpis na /zapasy, 6 na stranu). */
const loadSeasonResults = unstable_cache(
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
      // Jen pole, která `toResultRow` čte — `lineup` a jména asistentů by
      // payload stránky zbytečně nafoukly. Hráč (relace) jen se jménem.
      select: {
        slug: true,
        date: true,
        opponent: true,
        home: true,
        venue: true,
        competition: true,
        status: true,
        scoreOurs: true,
        scoreOpp: true,
        overtime: true,
        shootout: true,
        goals: { side: true, strength: true, scorer: true, scorerName: true },
      },
      populate: { players: { name: true } },
    })

    return {
      // `select` zúžil dokument; `toResultRow` čte jen vybraná pole.
      rows: result.docs.map((doc) => toResultRow(doc as Match)),
      page: result.page ?? 1,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
    }
  },
  ['season-results', 'v3'],
  { tags: [CACHE_TAGS.matches], revalidate: 3600 },
)

export const fetchSeasonResults = cache(loadSeasonResults)

/** Forma za posledních 5 odehraných zápasů sezóny (zleva nejstarší). */
const loadSeasonForm = unstable_cache(
  async (seasonId: number): Promise<TeamForm | null> => {
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

    const squares: FormSquare[] = docs.map(toFormSquare).reverse()

    const counts = { win: 0, draw: 0, otLoss: 0, loss: 0 }
    for (const square of squares) counts[square.outcome] += 1

    // Prohry po prodloužení / nájezdech se počítají do proher, závorka jen
    // řekne kolik z nich přineslo bod (bez nich by byla zbytečná).
    const ot = counts.otLoss ? ` (${counts.otLoss}× po prodl./sn)` : ''
    return {
      squares,
      summary: `${counts.win}× výhra · ${counts.draw}× remíza · ${counts.loss + counts.otLoss}× prohra${ot}`,
    }
  },
  ['season-form', 'v3'],
  { tags: [CACHE_TAGS.matches], revalidate: 3600 },
)

export const fetchSeasonForm = cache(loadSeasonForm)

/** Jeden zápas pro velkou kartu — depth 2 kvůli logu soupeře a reportáži. */
export const fetchMatchCard = cache(async (matchId: number): Promise<MatchCardData | null> => {
  const payload = await getPayload({ config: configPromise })
  const match = await payload.findByID({ collection: 'matches', id: matchId, depth: 2 })
  if (!match) return null

  const opponent = typeof match.opponent === 'object' ? match.opponent : null
  // Jen publikovaná reportáž: ruční vazba `matches.report` může mířit na
  // koncept, jehož URL je 404 (`resolveReport` navíc doplní článek ze sync).
  const report = await resolveReport(match)

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
    href: matchPath(match.slug),
  }
})
