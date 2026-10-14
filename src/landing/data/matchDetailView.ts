import type { Match, Post } from '@/payload-types'

import type {
  ArticleGoal,
  MatchDetail,
  MatchDetailReport,
  MatchGoalGroup,
  MatchPenaltyRow,
  MatchStatRow,
  Photo,
} from '../types'

import {
  formatLongDate,
  formatTime,
  htmlPlainText,
  postPath,
  snippet,
  toPhoto,
  uploadToPhoto,
} from './format'
import { goalName, toGoals } from './matchEvents'
import {
  CLUB_NAME,
  matchOutcome,
  matchTitle,
  opponentName,
  phaseLabel,
  scorersLabel,
  scoreSuffix,
} from './matchFormat'
import { seasonShortLabel } from './seasonLabel'

/**
 * View-model detailu zápasu — čisté funkce bez Payloadu za běhu, aby šly
 * testovat bez databáze (fetchery jsou v `matchDetail.ts`).
 */

/** Logo klubu — stejný soubor jako v navigaci a na kartě zápasu. */
const CLUB_LOGO: Photo = {
  url: '/logo-cestice.png',
  alt: CLUB_NAME,
  width: 200,
  height: 200,
  updatedAt: null,
}

/* ── Reportáž ────────────────────────────────────────────────────────────── */

const isPublished = (post: Post | null | undefined): post is Post =>
  Boolean(post) && post!._status === 'published'

/**
 * Rozhodnutí, která reportáž k zápasu patří. Vazba je v datech dvojí
 * a nikdo ji nesjednocuje: `matches.report` (ručně, jde nastavit i na
 * koncept) a `posts.match` (zakládá ji synchronizace s AHL).
 *
 * 1. `matches.report`, pokud je **publikovaná** — koncept by veřejně
 *    odkazoval na 404,
 * 2. jinak nejnovější publikovaný článek, který míří na zápas přes
 *    `posts.match`,
 * 3. jinak nic.
 *
 * `linked` smí být i nepopulovaná relace (číslo) — taková se bere jako
 * neznámá, ne jako publikovaná.
 */
export const pickReport = (
  linked: number | Post | null | undefined,
  candidates: readonly Post[],
): Post | null => {
  if (typeof linked === 'object' && isPublished(linked)) return linked

  const time = (post: Post): number => (post.publishedAt ? Date.parse(post.publishedAt) : 0)
  return (
    [...candidates]
      .filter(isPublished)
      .sort((a, b) => time(b) - time(a))
      .at(0) ?? null
  )
}

/* ── Branky ──────────────────────────────────────────────────────────────── */

/** „12:34" → vteřiny; nečitelný čas dá `NaN`. */
const toSeconds = (time: string): number => {
  const [minutes, seconds] = time.split(':').map(Number)
  return (minutes ?? NaN) * 60 + (seconds ?? 0)
}

/**
 * Mezititulek branky podle času. Rozhodující nájezd AHL zapisuje jako
 * branku v 60:00, takže by se bez `special` počítal do třetí třetiny —
 * proto má přednost.
 */
export const goalGroupLabel = (goal: Pick<ArticleGoal, 'time' | 'special'>): string => {
  if (goal.special === 'sn') return 'Nájezdy'
  const seconds = toSeconds(goal.time)
  // Nečitelný čas (nemělo by se stát, parser ho vynutí) nesmí branku ztratit.
  if (Number.isNaN(seconds)) return 'Branky'
  if (seconds > 60 * 60) return 'Prodloužení'
  if (seconds <= 20 * 60) return '1. třetina'
  if (seconds <= 40 * 60) return '2. třetina'
  return '3. třetina'
}

/**
 * Klíč řazení branek: vteřiny, nečitelný čas za pravidelnými brankami,
 * rozhodující nájezd úplně na konci (AHL ho píše jako 60:00, takže by jinak
 * předběhl prodloužení).
 */
const goalSortKey = (goal: Pick<ArticleGoal, 'time' | 'special'>): number => {
  if (goal.special === 'sn') return Number.MAX_SAFE_INTEGER
  const seconds = toSeconds(goal.time)
  return Number.isNaN(seconds) ? Number.MAX_SAFE_INTEGER - 1 : seconds
}

/**
 * Branky seskupené podle třetin; pořadí skupin i branek je chronologické.
 *
 * Nejdřív se stabilně seřadí podle času: ručně zapsané branky nemusí být
 * seřazené a seskupování jen sousedů by pak vyrobilo dvě skupiny téhož
 * názvu (a duplicitní React `key` v `GoalsSummary`).
 */
export const groupGoals = (goals: ArticleGoal[]): MatchGoalGroup[] => {
  const sorted = [...goals].sort((a, b) => goalSortKey(a) - goalSortKey(b))
  const groups: MatchGoalGroup[] = []
  for (const goal of sorted) {
    const label = goalGroupLabel(goal)
    const last = groups.at(-1)
    if (last?.label === label) last.goals.push(goal)
    else groups.push({ label, goals: [goal] })
  }
  return groups
}

/* ── Tresty a statistika ─────────────────────────────────────────────────── */

const toPenalties = (match: Match): MatchPenaltyRow[] =>
  (match.penalties ?? []).map((penalty) => ({
    time: penalty.time ?? '',
    player: goalName(penalty.playerName, penalty.player) ?? 'Neznámý hráč',
    minutes: penalty.minutes ?? null,
    kind: penalty.kind || null,
    reason: penalty.reason || null,
  }))

const numberRow = (
  label: string,
  ours: number | null | undefined,
  opp: number | null | undefined,
): MatchStatRow | null => {
  if (ours == null && opp == null) return null
  return {
    label,
    ours: ours == null ? '–' : String(ours),
    opp: opp == null ? '–' : String(opp),
    oursValue: ours ?? null,
    oppValue: opp ?? null,
  }
}

/** Čas v přesilovce je text „m:ss" — žádný pruh, jen dvojice hodnot. */
const textRow = (
  label: string,
  ours: string | null | undefined,
  opp: string | null | undefined,
): MatchStatRow | null => {
  const [a, b] = [ours?.trim() || null, opp?.trim() || null]
  if (!a && !b) return null
  return { label, ours: a ?? '–', opp: b ?? '–', oursValue: null, oppValue: null }
}

/** Řádky statistiky jen pro vyplněné hodnoty (`stats` může chybět celé). */
const toStats = (match: Match): MatchStatRow[] => {
  const stats = match.stats
  if (!stats) return []
  return [
    numberRow('Vyloučení', stats.penaltiesOurs, stats.penaltiesOpp),
    numberRow('Vyšší tresty', stats.majorsOurs, stats.majorsOpp),
    numberRow('Využité přesilovky', stats.ppGoalsOurs, stats.ppGoalsOpp),
    textRow('Čas v přesilovce', stats.ppTimeOurs, stats.ppTimeOpp),
  ].filter((row): row is MatchStatRow => row !== null)
}

/* ── Reportáž a galerie ──────────────────────────────────────────────────── */

const toReport = (post: Post | null): MatchDetailReport | null => {
  const href = postPath(post?.slug)
  if (!post || !href) return null
  const excerpt = snippet(htmlPlainText(post.excerpt || post.meta?.description || ''), 200)
  return {
    title: post.title,
    excerpt: excerpt || null,
    photo: typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null,
    href,
  }
}

/* ── Složení ─────────────────────────────────────────────────────────────── */

/**
 * Zápas → view-model detailu. `match` musí mít populované relace
 * (soupeř + logo, sezóna, hráči aspoň se jménem, galerie se `slug` a
 * `title` — `match.gallery`); `report` je už rozhodnutá reportáž
 * (`pickReport`).
 */
export const toMatchDetail = (match: Match, report: Post | null): MatchDetail => {
  const weAreHome = Boolean(match.home)
  const played = match.status === 'played'
  const opponent = typeof match.opponent === 'object' && match.opponent ? match.opponent : null
  const opponentLogo = uploadToPhoto(opponent?.logo)
  const season = typeof match.season === 'object' && match.season ? match.season : null
  const album = typeof match.gallery === 'object' ? match.gallery : null

  const hasScore = played && match.scoreOurs != null && match.scoreOpp != null
  const goals = toGoals(match, weAreHome)
  const penalties = toPenalties(match)
  const stats = toStats(match)

  // Bezbrankové 0:0 se zápisem nemá chybět nic — poznámka by lhala.
  const scoreless = (match.scoreOurs ?? 0) + (match.scoreOpp ?? 0) === 0
  const missingProtocol =
    played &&
    goals.length === 0 &&
    penalties.length === 0 &&
    stats.length === 0 &&
    !(scoreless && match.ahl?.hasReport)

  return {
    id: match.id,
    slug: match.slug ?? '',
    status: match.status,
    kickoffISO: match.date,
    dateLabel: formatLongDate(match.date),
    timeLabel: formatTime(match.date),
    venue: match.venue || null,
    competition: match.competition || null,
    phase: phaseLabel(match),
    title: matchTitle(match),
    homeName: weAreHome ? CLUB_NAME : opponentName(match),
    awayName: weAreHome ? opponentName(match) : CLUB_NAME,
    homeLogo: weAreHome ? CLUB_LOGO : opponentLogo,
    awayLogo: weAreHome ? opponentLogo : CLUB_LOGO,
    weAreHome,
    homeScore: hasScore ? (weAreHome ? match.scoreOurs! : match.scoreOpp!) : null,
    awayScore: hasScore ? (weAreHome ? match.scoreOpp! : match.scoreOurs!) : null,
    thirds: hasScore
      ? (match.thirds ?? []).map((third) =>
          weAreHome ? `${third.ours}:${third.opp}` : `${third.opp}:${third.ours}`,
        )
      : [],
    suffix: hasScore ? scoreSuffix(match) : '',
    outcome: hasScore ? matchOutcome(match) : null,
    seasonSlug: season?.slug || null,
    seasonLabel: season ? seasonShortLabel(season) : null,
    goalGroups: groupGoals(goals),
    penalties,
    penaltyMinutes: penalties.reduce((sum, penalty) => sum + (penalty.minutes ?? 0), 0),
    stats,
    scorers: scorersLabel(match),
    report: toReport(report),
    gallery: album?.slug ? { title: album.title, href: `/fotogalerie/${album.slug}` } : null,
    missingProtocol,
  }
}

/* ── Texty pro metadata ──────────────────────────────────────────────────── */

/** „HC Čestice 5:3 HC Zdar" u odehraného zápasu, jinak „HC Čestice × HC Zdar". */
export const matchHeadline = (detail: MatchDetail): string =>
  detail.homeScore != null && detail.awayScore != null
    ? `${detail.homeName} ${detail.homeScore}:${detail.awayScore} ${detail.awayName}`
    : detail.title

/** Popis stránky ze skóre a střelců, u neodehraného zápasu z data a místa. */
export const matchDescription = (detail: MatchDetail): string => {
  const place = detail.venue ? `, ${detail.venue}` : ''
  if (detail.status === 'canceled') {
    return `Zápas ${detail.title} (${detail.dateLabel}${place}) byl zrušen.`
  }
  if (detail.homeScore == null && detail.status === 'played') {
    // Odehráno, ale skóre se nepodařilo zapsat — „se hraje" by lhalo.
    return `Zápas ${detail.title} (${detail.dateLabel}${place}) se odehrál, výsledek zatím není zapsaný.`
  }
  if (detail.homeScore == null) {
    return `Zápas ${detail.title} se hraje ${detail.dateLabel} v ${detail.timeLabel}${place}.`
  }
  const suffix = detail.suffix === 'sn' ? ' po nájezdech' : detail.suffix === 'pp' ? ' po prodloužení' : ''
  return [
    `Výsledek zápasu ${matchHeadline(detail)}${suffix} (${detail.dateLabel}${place}).`,
    detail.scorers ? `Střelci Čestic: ${detail.scorers}.` : null,
    detail.penalties.length ? `Tresty HC Čestice: ${detail.penaltyMinutes} min.` : null,
  ]
    .filter(Boolean)
    .join(' ')
}
