import type { Match, Post } from '@/payload-types'

import type {
  ArticleGoal,
  MatchDetail,
  MatchDetailReport,
  MatchPenaltyRow,
  MatchStatRow,
  MatchTimelineEvent,
  MatchTimelinePeriod,
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
  CLUB_LOGO,
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

/* ── Časová osa ──────────────────────────────────────────────────────────── */

/**
 * „12:34" → vteřiny; nečitelný čas dá `NaN`. Formát se ověřuje regexem:
 * `Number('')` je 0, takže ručně zadaný trest bez času by se jinak tvářil
 * jako 0:00 a skočil na začátek 1. třetiny místo do „Ostatní".
 */
const toSeconds = (time: string): number => {
  const parts = /^(\d+):(\d{1,2})$/.exec(time.trim())
  return parts ? Number(parts[1]) * 60 + Number(parts[2]) : NaN
}

/**
 * Úsek osy podle času události (branky i trestu). Rozhodující nájezd AHL
 * zapisuje jako branku v 60:00, takže by se bez `special` počítal do třetí
 * třetiny — proto má přednost.
 */
export const periodLabel = (event: { time: string; special?: ArticleGoal['special'] }): string => {
  if (event.special === 'sn') return 'Nájezdy'
  const seconds = toSeconds(event.time)
  // Nečitelný čas (nemělo by se stát, parser ho vynutí) nesmí událost ztratit.
  if (Number.isNaN(seconds)) return 'Ostatní'
  if (seconds > 60 * 60) return 'Prodloužení'
  if (seconds <= 20 * 60) return '1. třetina'
  if (seconds <= 40 * 60) return '2. třetina'
  return '3. třetina'
}

const THIRD_INDEX: Record<string, number> = { '1. třetina': 0, '2. třetina': 1, '3. třetina': 2 }

/**
 * Klíč řazení: vteřiny, nečitelný čas za pravidelnými událostmi,
 * rozhodující nájezd úplně na konci (AHL ho píše jako 60:00, takže by jinak
 * předběhl prodloužení).
 */
const sortKey = (event: { time: string; special?: ArticleGoal['special'] }): number => {
  if (event.special === 'sn') return Number.MAX_SAFE_INTEGER
  const seconds = toSeconds(event.time)
  return Number.isNaN(seconds) ? Number.MAX_SAFE_INTEGER - 1 : seconds
}

/** Branka ze zápisu → událost osy; soupeřova přijde o jména (viz `MatchTimelineEvent`). */
const goalEvent = (goal: ArticleGoal): MatchTimelineEvent => {
  if (!goal.ours) return { type: 'goal', ours: false, time: goal.time, score: goal.score }
  const { ours: _ours, ...rest } = goal
  return { type: 'goal', ours: true, ...rest }
}

/** Skóre úseku spočítané z branek („domácí:hosté"), když ho zápis nemá. */
const countScore = (events: MatchTimelineEvent[], weAreHome: boolean): string => {
  let ours = 0
  let opp = 0
  for (const event of events) {
    if (event.type !== 'goal') continue
    if (event.ours) ours++
    else opp++
  }
  return weAreHome ? `${ours}:${opp}` : `${opp}:${ours}`
}

/**
 * Časová osa po třetinách — branky obou týmů a tresty HC Čestice v jednom
 * chronologickém sledu (styl Livesportu, ale jen s naší stranou).
 *
 * - Nejdřív se vše stabilně seřadí: ručně zapsané branky nemusí být
 *   seřazené a seskupování jen sousedů by vyrobilo dvě skupiny téhož názvu
 *   (a duplicitní React `key`). Při shodném čase jde branka před trest.
 * - Skóre třetiny bere `thirds` (`homeThirds` už v pořadí domácí : hosté;
 *   synchronizace ukládá jen tři), jinak — a u prodloužení vždy — se
 *   spočítá z branek úseku. Nájezdy skóre nemají: z jedné rozhodující
 *   branky by vyšlo zavádějící „1:0".
 */
export const buildTimeline = (
  goals: readonly ArticleGoal[],
  penalties: readonly MatchPenaltyRow[],
  homeThirds: readonly string[],
  weAreHome: boolean,
): MatchTimelinePeriod[] => {
  const items = [
    ...goals.map((goal) => ({
      key: sortKey(goal),
      rank: 0,
      label: periodLabel(goal),
      event: goalEvent(goal),
    })),
    ...penalties.map((penalty) => ({
      key: sortKey(penalty),
      rank: 1,
      label: periodLabel(penalty),
      event: { type: 'penalty' as const, ...penalty },
    })),
  ].sort((a, b) => a.key - b.key || a.rank - b.rank)

  const periods: MatchTimelinePeriod[] = []
  for (const item of items) {
    const last = periods.at(-1)
    if (last?.label === item.label) last.events.push(item.event)
    else periods.push({ label: item.label, score: null, events: [item.event] })
  }

  for (const period of periods) {
    if (period.label === 'Nájezdy' || period.label === 'Ostatní') continue
    const index = THIRD_INDEX[period.label]
    period.score = (index != null && homeThirds[index]) || countScore(period.events, weAreHome)
  }
  return periods
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
  const homeThirds = (match.thirds ?? []).map((third) =>
    weAreHome ? `${third.ours}:${third.opp}` : `${third.opp}:${third.ours}`,
  )

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
    thirds: hasScore ? homeThirds : [],
    suffix: hasScore ? scoreSuffix(match) : '',
    outcome: hasScore ? matchOutcome(match) : null,
    seasonSlug: season?.slug || null,
    seasonLabel: season ? seasonShortLabel(season) : null,
    timeline: buildTimeline(goals, penalties, homeThirds, weAreHome),
    goalsOurs: goals.filter((goal) => goal.ours).length,
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
  const suffix =
    detail.suffix === 'sn' ? ' po nájezdech' : detail.suffix === 'pp' ? ' po prodloužení' : ''
  return [
    `Výsledek zápasu ${matchHeadline(detail)}${suffix} (${detail.dateLabel}${place}).`,
    detail.scorers ? `Střelci Čestic: ${detail.scorers}.` : null,
    detail.penalties.length ? `Tresty HC Čestice: ${detail.penaltyMinutes} min.` : null,
  ]
    .filter(Boolean)
    .join(' ')
}
