import 'server-only'

import type { Payload, Where } from 'payload'
import { cache } from 'react'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import type {
  FixtureCard,
  FormSquare,
  LastResult,
  MatchCardData,
  MatchRow,
  ResultRow,
  TeamForm,
  UpcomingMatch,
} from '@/landing/features/matches/types'
import {
  formatCompetition,
  matchOutcome,
  matchScore,
  matchTitle,
  phaseLabel,
  scorersLabel,
  scoreSuffix,
} from '@/landing/features/matches/view/matchFormat'
import {
  toFixtureCard,
  toFormSquare,
  toLastResult,
  toMatchRow,
  toResultRow,
  toUpcoming,
} from '@/landing/features/matches/view/matchRows'
import { uploadToPhoto } from '@/landing/lib/media'
import { formatDateTime } from '@/lib/datetime'
import { isMatchHidden, VISIBLE_MATCH } from '@/lib/matchVisibility'
import { linkOrNull, routes } from '@/lib/routes'
import type { Match, Media } from '@/payload-types'

import { resolveReport } from './matchDetail'

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
export const fetchUpcoming = cache(async (): Promise<{ upcoming: UpcomingMatch | null }> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where: {
      and: [
        VISIBLE_MATCH,
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
})

/** Poslední výsledek (hero). */
export const fetchPlayed = cache(async (): Promise<{ lastResult: LastResult | null }> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where: { and: [VISIBLE_MATCH, { status: { equals: 'played' } }] },
    sort: '-date',
    limit: 1,
    depth: 1,
  })

  const [last] = docs
  return { lastResult: last ? toLastResult(last) : null }
})

/** Seznam zápasů pro widget — výsledky (se skóre) nebo rozpis. */
export const fetchMatchRows = cache(
  async (options: {
    mode: 'results' | 'schedule'
    seasonId?: number | null
    teamId?: number | null
    limit: number
  }): Promise<MatchRow[]> => {
    const payload = await getPayloadClient()
    const and: Where[] = [
      VISIBLE_MATCH,
      { status: { equals: options.mode === 'results' ? 'played' : 'scheduled' } },
    ]
    if (options.mode === 'schedule') {
      and.push({ date: { greater_than_equal: new Date().toISOString() } })
    }
    if (options.seasonId) and.push({ season: { equals: options.seasonId } })
    if (options.teamId) and.push({ team: { equals: options.teamId } })

    const { docs } = await payload.find({
      collection: 'matches',
      where: { and },
      sort: options.mode === 'results' ? '-date' : 'date',
      limit: options.limit,
      depth: 1,
    })
    return docs.map(toMatchRow)
  },
)

/** Vybrané zápasy (v pořadí výběru) → řádky widgetu. */
export const fetchPickedMatchRows = cache(async (matchIds: number[]): Promise<MatchRow[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where: { and: [VISIBLE_MATCH, { id: { in: matchIds } }] },
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
 * zápasu, `v3` = výsledek `otLoss`, o verzi výš = čitelné fáze VČHL „Základní část"
 * místo „2.ročník - ZČ"). `unstable_cache` skládá klíč jen z těchto řetězců a argumentů, takže
 * entry uložená před změnou tvaru by bez nového klíče žila až do `revalidate`
 * (hodina) bez odkazů. Tag (`matches-list`) zůstává, takže hook zápasů
 * invaliduje i nové entry.
 */

/**
 * Doplní zápasům populované logo soupeře. Výpisy jedou na `depth: 1`, kde je
 * `opponent.logo` jen id — `depth: 2` by ale rozbalil i sezónu, reportáž
 * a hráče v sestavě. Jeden dotaz na `media` pro celou stránku je levnější.
 */
const withOpponentLogos = async <T extends Match>(payload: Payload, docs: T[]): Promise<T[]> => {
  const ids = [
    ...new Set(
      docs.flatMap((doc) =>
        typeof doc.opponent === 'object' && typeof doc.opponent?.logo === 'number'
          ? [doc.opponent.logo]
          : [],
      ),
    ),
  ]
  if (ids.length === 0) return docs
  const { docs: media } = await payload.find({
    collection: 'media',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 0,
    pagination: false,
    // `url` je virtuální pole skládané z `filename` — bez něj vyjde prázdné.
    select: { url: true, filename: true, alt: true, width: true, height: true, updatedAt: true },
  })
  const byId = new Map(media.map((item) => [item.id, item as Media]))
  return docs.map((doc) =>
    typeof doc.opponent === 'object' && typeof doc.opponent?.logo === 'number'
      ? { ...doc, opponent: { ...doc.opponent, logo: byId.get(doc.opponent.logo) ?? null } }
      : doc,
  )
}

/**
 * Zápas s populovaným logem soupeře pro hero reportáže: článek se čte na
 * `depth: 2`, kde je `post.match.opponent` objekt, ale jeho `logo` jen id.
 */
export const withMatchLogo = async (match: Match): Promise<Match> => {
  const payload = await getPayloadClient()
  const [withLogo] = await withOpponentLogos(payload, [match])
  return withLogo ?? match
}

/** Rozlosování sezóny — celé, od nejbližšího zápasu (pás karet na /zapasy). */
const loadSeasonFixtures = cachedQuery(
  async (seasonId: number, from: string): Promise<FixtureCard[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'matches',
      where: {
        and: [
          VISIBLE_MATCH,
          { season: { equals: seasonId } },
          { status: { equals: 'scheduled' } },
          { date: { greater_than_equal: from } },
        ],
      },
      sort: 'date',
      limit: 0,
      depth: 1,
    })

    const withLogos = await withOpponentLogos(payload, docs)
    return withLogos.map((match, index) => toFixtureCard(match, index === 0))
  },
  // v5: řádky nesou znaky týmů a den v týdnu
  { key: 'season-fixtures', version: 'v5', tags: [CACHE_TAGS.matches] },
)

export const fetchSeasonFixtures = async (seasonId: number): Promise<FixtureCard[]> =>
  loadSeasonFixtures(seasonId, scheduleFrom())

/** Odehrané zápasy sezóny po stranách (výpis na /zapasy, 6 na stranu). */
export const fetchSeasonResults = cachedQuery(
  async (options: {
    seasonId: number
    page: number
    perPage: number
  }): Promise<{ rows: ResultRow[]; page: number; totalPages: number; totalDocs: number }> => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'matches',
      where: {
        and: [
          VISIBLE_MATCH,
          { season: { equals: options.seasonId } },
          { status: { equals: 'played' } },
        ],
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

    const docs = await withOpponentLogos(payload, result.docs as Match[])
    return {
      // `select` zúžil dokument; `toResultRow` čte jen vybraná pole.
      rows: docs.map((doc) => toResultRow(doc)),
      page: result.page ?? 1,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
    }
  },
  // v6: řádky nesou znaky týmů a den v týdnu
  { key: 'season-results', version: 'v6', tags: [CACHE_TAGS.matches] },
)

/** Forma za posledních 5 odehraných zápasů sezóny (zleva nejstarší). */
export const fetchSeasonForm = cachedQuery(
  async (seasonId: number): Promise<TeamForm | null> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'matches',
      where: {
        and: [VISIBLE_MATCH, { season: { equals: seasonId } }, { status: { equals: 'played' } }],
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
  { key: 'season-form', version: 'v4', tags: [CACHE_TAGS.matches] },
)

/**
 * Jeden zápas pro velkou kartu — depth 2 kvůli logu soupeře a reportáži.
 *
 * Tagovaná cache (`matches-list` + `posts-list` kvůli reportáži): kartu čtou
 * i články (rich text), které se regenerují jen ISR, takže bez tagu by uložení
 * zápasu dorazilo až po vypršení stránky.
 */
export const fetchMatchCard = cachedQuery(
  async (matchId: number): Promise<MatchCardData | null> => {
    const payload = await getPayloadClient()
    const match = await payload.findByID({
      collection: 'matches',
      id: matchId,
      depth: 2,
      disableErrors: true,
    })
    if (!match || isMatchHidden(match)) return null

    const opponent = typeof match.opponent === 'object' ? match.opponent : null
    // Jen publikovaná reportáž: ruční vazba `matches.report` může mířit na
    // koncept, jehož URL je 404 (`resolveReport` navíc doplní článek ze sync).
    const report = await resolveReport(match)

    return {
      id: match.id,
      status: match.status,
      dateLabel: formatDateTime(match.date),
      competition: formatCompetition(match.competition),
      venue: match.venue ?? null,
      home: Boolean(match.home),
      opponentName: opponent?.name ?? 'Soupeř',
      opponentLogo: uploadToPhoto(opponent?.logo),
      score: match.status === 'played' ? matchScore(match) : null,
      suffix: scoreSuffix(match),
      won: match.status === 'played' ? (match.scoreOurs ?? 0) > (match.scoreOpp ?? 0) : null,
      reportHref: linkOrNull(routes.post, report?.slug),
      href: linkOrNull(routes.match, match.slug),
    }
  },
  { key: 'match-card', version: 'v1', tags: [CACHE_TAGS.matches, CACHE_TAGS.posts] },
)
